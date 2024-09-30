from flask import Flask, request, jsonify
from models.llama_model import LLaMAModel

app = Flask(__name__)

llama_model = LLaMAModel()

@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    prompt = data.get("prompt", "")
    response = llama_model.generate_response(prompt)
    return jsonify({"response": response})

if __name__ == '__main__':
    app.run(debug=True)

