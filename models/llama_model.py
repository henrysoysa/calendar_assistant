from transformers import AutoModelForCausalLM, AutoTokenizer

class LLaMAModel:
    def __init__(self, model_name: str = "meta-llama/Llama-2-7b-hf"):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name, use_auth_token=True)
        self.model = AutoModelForCausalLM.from_pretrained(model_name, use_auth_token=True)

    def generate_response(self, prompt: str, max_length: int = 50) -> str:
        inputs = self.tokenizer(prompt, return_tensors="pt")
        outputs = self.model.generate(inputs['input_ids'], max_length=max_length)
        return self.tokenizer.decode(outputs[0], skip_special_tokens=True)
