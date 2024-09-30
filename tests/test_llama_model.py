import unittest
from models.llama_model import LLaMAModel

class TestLLaMAModel(unittest.TestCase):
    def setUp(self):
        self.model = LLaMAModel()

    def test_generate_response(self):
        prompt = "Tell me a joke."
        response = self.model.generate_response(prompt)
        self.assertIsInstance(response, str)
        self.assertGreater(len(response), 0)

if __name__ == '__main__':
    unittest.main()
