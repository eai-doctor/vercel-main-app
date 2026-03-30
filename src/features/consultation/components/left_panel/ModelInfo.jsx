export default function ModelInfo({
}) {
    return(
        {/* {modelInfo && (
                    <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border-l-4 border-blue-500">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${modelInfo.source === 'ollama' ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`}></div>
                          <div>
                            <div className="text-sm font-semibold text-gray-700">
                              AI Model: {modelInfo.source === 'ollama' ? '🖥️ Local (Ollama)' : '☁️ Cloud (OpenAI)'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {modelInfo.model}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                          {modelInfo.source === 'ollama' ? '⚡ Fast & Private' : '🌐 API-based'}
                        </div>
                      </div>
                    </div>
                  )} */}
    )
}