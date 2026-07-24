import unittest

from world_model import POLICIES, choose_policy, paired_experiment, simulate


class WorldModelTests(unittest.TestCase):
    def test_simulation_is_deterministic(self):
        self.assertEqual(simulate(POLICIES[1], 1176), simulate(POLICIES[1], 1176))

    def test_experiment_returns_all_policies(self):
        result = paired_experiment(range(1176, 1196))
        self.assertEqual(set(result), {"monitor", "balanced", "survival", "expansion"})

    def test_choice_is_feasible_or_safe_fallback(self):
        result = paired_experiment(range(1176, 1236))
        selected = choose_policy(result)
        self.assertIn(selected, {"balanced", "survival"})


if __name__ == "__main__":
    unittest.main()
