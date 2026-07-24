"""ARES V8.1 deterministic Mars-base world-model core.

This reference engine is intentionally dependency-free. The GitHub Pages frontend
runs a deterministic JavaScript mirror because static hosting cannot execute a
server-side Python process. Both implementations use the same decision contract:
sense -> simulate -> decide -> authorize -> verify.
"""

from __future__ import annotations

from dataclasses import dataclass, replace
from random import Random
from statistics import quantiles
from typing import Iterable


@dataclass(frozen=True)
class WorldState:
    hour: int = 0
    dust_tau: float = 0.42
    solar_kw: float = 10.0
    fission_kw: float = 6.0
    soc: float = 66.1
    oxygen: float = 88.4
    water: float = 71.8
    critical_load_kw: float = 8.4
    mission_load_kw: float = 5.8


@dataclass(frozen=True)
class Policy:
    name: str
    mission_fraction: float
    fission_target_kw: float
    clean_hour: int | None


@dataclass(frozen=True)
class Outcome:
    policy: str
    final_soc: float
    minimum_soc: float
    mission_energy_fraction: float
    safe: bool


POLICIES = (
    Policy("monitor", 1.00, 6.0, None),
    Policy("balanced", 0.585, 12.0, 8),
    Policy("survival", 0.377, 14.0, 4),
    Policy("expansion", 1.20, 8.0, None),
)


def clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def step(state: WorldState, policy: Policy, dust_tau: float) -> WorldState:
    """Advance one hour with rate-limited power and explicit resource bounds."""
    cleaned_tau = dust_tau * 0.48 if policy.clean_hour == state.hour else dust_tau
    solar = 10.0 * max(0.08, 1.0 - cleaned_tau / 4.2)
    fission_delta = clamp(policy.fission_target_kw - state.fission_kw, -1.4, 1.4)
    fission = clamp(state.fission_kw + fission_delta, 4.0, 14.0)
    load = state.critical_load_kw + state.mission_load_kw * policy.mission_fraction
    soc = clamp(state.soc + (solar + fission - load) * 0.54, 0.0, 100.0)
    oxygen = clamp(state.oxygen - 0.03 - (0.35 if soc < 20 else 0.0), 0.0, 100.0)
    water = clamp(state.water - 0.025, 0.0, 100.0)
    return replace(
        state,
        hour=state.hour + 1,
        dust_tau=cleaned_tau,
        solar_kw=solar,
        fission_kw=fission,
        soc=soc,
        oxygen=oxygen,
        water=water,
    )


def simulate(policy: Policy, seed: int, hours: int = 48) -> Outcome:
    random = Random(seed)
    state = WorldState()
    minimum_soc = state.soc
    for hour in range(hours):
        storm = 3.25 + 0.62 * random.random() + 0.35 * max(0.0, 1.0 - hour / 30)
        state = step(state, policy, storm)
        minimum_soc = min(minimum_soc, state.soc)
    safe = minimum_soc >= 20.0 and state.oxygen >= 70.0 and state.water >= 55.0
    return Outcome(policy.name, state.soc, minimum_soc, policy.mission_fraction, safe)


def paired_experiment(seeds: Iterable[int] = range(1176, 1776)) -> dict[str, dict[str, float]]:
    """Evaluate every policy on exactly the same external disturbance seeds."""
    result: dict[str, dict[str, float]] = {}
    for policy in POLICIES:
        outcomes = [simulate(policy, seed) for seed in seeds]
        minima = sorted(item.minimum_soc for item in outcomes)
        p10 = quantiles(minima, n=10, method="inclusive")[0]
        result[policy.name] = {
            "safety_rate": sum(item.safe for item in outcomes) / len(outcomes),
            "soc_p10": p10,
            "mission_energy_fraction": policy.mission_fraction,
        }
    return result


def choose_policy(results: dict[str, dict[str, float]]) -> str:
    feasible = {
        name: values
        for name, values in results.items()
        if values["safety_rate"] >= 0.99 and values["soc_p10"] >= 20.0
    }
    if not feasible:
        return "survival"
    return max(feasible, key=lambda name: feasible[name]["mission_energy_fraction"])


if __name__ == "__main__":
    evidence = paired_experiment()
    print({"recommended": choose_policy(evidence), "evidence": evidence})
