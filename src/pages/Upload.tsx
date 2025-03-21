import { useState, useRef } from 'react'
import Layout from '../components/Layout'
import ValueNodeModal from '../components/ValueNodeModal'

interface Restriction {
  type: string
  min?: number
  max?: number
  validValues?: string[]
}

interface NodeMetadata {
  instructions?: string
  restrictions?: Restriction
}

interface UploadState {
  steps: File | null
  scribe: File | null
  stepsContent: Record<string, unknown> | null
  showTree: boolean
  metadata: Record<string, NodeMetadata>
  selectedNode: { key: string; value: unknown } | null
  isModalOpen: boolean
  isSubmitting: boolean
}

interface JsonTreeNodeProps {
  data: Record<string, unknown> | unknown[]
  level?: number
  path?: string
  metadata: Record<string, NodeMetadata>
  onNodeClick: (e: React.MouseEvent, key: string, value: unknown) => void
}

function JsonTreeNode({ data, level = 0, path = '', metadata, onNodeClick }: JsonTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasChildren = typeof data === 'object' && data !== null && !Array.isArray(data)
  const isArray = Array.isArray(data)

  const handleNodeClick = (e: React.MouseEvent, key: string, value: unknown) => {
    e.preventDefault()
    e.stopPropagation()
    if (!hasChildren && !isArray) {
      onNodeClick(e, key, value)
    }
  }

  const handleExpandClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  return (
    <div className="ml-4 font-mono text-sm">
      {hasChildren || isArray ? (
        <>
          <button
            onClick={handleExpandClick}
            className="flex items-center text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
          >
            <svg
              className={`w-3.5 h-3.5 mr-1 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-xs font-medium">
              {isArray ? `[${Object.keys(data).length} items]` : '{...}'}
            </span>
          </button>
          {isExpanded && (
            <div className="ml-4">
              {Object.entries(data).map(([key, value]) => (
                <div key={key} className="py-0.5">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{key}</span>
                  <span className="text-gray-500 dark:text-gray-400 mx-1">:</span>
                  <JsonTreeNode
                    data={value as Record<string, unknown> | unknown[]}
                    level={level + 1}
                    path={`${path}${path ? '.' : ''}${key}`}
                    metadata={metadata}
                    onNodeClick={onNodeClick}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <span
          className={`text-gray-600 dark:text-gray-300 cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 transition-colors ${
            metadata[path] ? 'underline decoration-blue-500 dark:decoration-blue-400' : ''
          }`}
          onClick={(e) => handleNodeClick(e, path, data)}
        >
          {typeof data === 'string' ? `"${data}"` : String(data)}
        </span>
      )}
    </div>
  )
}

export default function Upload() {
  const [state, setState] = useState<UploadState>({
    steps: null,
    scribe: null,
    stepsContent: null,
    showTree: false,
    metadata: {},
    selectedNode: null,
    isModalOpen: false,
    isSubmitting: false,
  })

  const stepsInputRef = useRef<HTMLInputElement>(null)
  const scribeInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent, type: 'steps' | 'scribe') => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files[0]
    if (!file) return

    await handleFile(file, type)
  }

  const handleFile = async (file: File, type: 'steps' | 'scribe') => {
    if (type === 'steps' && file.type === 'application/json') {
      const content = await file.text()
      try {
        const jsonContent = JSON.parse(content) as Record<string, unknown>
        setState(prev => ({
          ...prev,
          steps: file,
          stepsContent: jsonContent,
        }))
      } catch {
        console.error('Invalid JSON file')
      }
    } else if (type === 'scribe' && file.type === 'application/pdf') {
      setState(prev => ({
        ...prev,
        scribe: file,
      }))
    }
  }

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'steps' | 'scribe') => {
    const file = e.target.files?.[0]
    if (file) {
      await handleFile(file, type)
    }
  }

  const handleAdvance = () => {
    setState(prev => ({
      ...prev,
      showTree: true,
    }))
  }

  const handleNodeClick = (e: React.MouseEvent, key: string, value: unknown) => {
    setState(prev => ({
      ...prev,
      selectedNode: { key, value },
      isModalOpen: true,
    }))
  }

  const handleAddInstructions = (instructions: string) => {
    setState(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [prev.selectedNode!.key]: {
          ...prev.metadata[prev.selectedNode!.key],
          instructions,
        },
      },
    }))
  }

  const handleAddRestrictions = (restrictions: Restriction) => {
    setState(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [prev.selectedNode!.key]: {
          ...prev.metadata[prev.selectedNode!.key],
          restrictions,
        },
      },
    }))
  }

  const handleSubmit = async () => {
    if (!state.stepsContent || !state.steps) {
      alert('Please upload a JSON file first')
      return
    }

    setState(prev => ({ ...prev, isSubmitting: true }))

    try {
      // Create FormData for file uploads
      const formData = new FormData()

      // Add the JSON content directly
      formData.append('steps', JSON.stringify(state.stepsContent))

      // Add the PDF file if present
      if (state.scribe) {
        formData.append('scribe', state.scribe)
      }

      // Add the metadata as a JSON string
      formData.append('metadata', JSON.stringify(state.metadata))

      // Send the request
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Submission failed')
      }

      alert('Submission successful!')

      // Reset the form
      setState(prev => ({
        ...prev,
        steps: null,
        scribe: null,
        stepsContent: null,
        showTree: false,
        metadata: {},
        selectedNode: null,
        isModalOpen: false,
      }))
    } catch (error) {
      console.error('Submission error:', error)
      alert('Failed to submit. Please try again.')
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  const content = state.showTree && state.stepsContent ? (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">JSON Tree View</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={state.isSubmitting}
            className={`relative px-5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              state.isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 hover:shadow-lg hover:shadow-green-500/25 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
            }`}
          >
            {state.isSubmitting ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Submitting...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Submit</span>
              </div>
            )}
          </button>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <JsonTreeNode
          data={state.stepsContent}
          metadata={state.metadata}
          onNodeClick={handleNodeClick}
        />
      </div>
      {state.selectedNode && (
        <ValueNodeModal
          isOpen={state.isModalOpen}
          onClose={() => setState(prev => ({ ...prev, isModalOpen: false }))}
          onAddInstructions={handleAddInstructions}
          onAddRestrictions={handleAddRestrictions}
          nodeKey={state.selectedNode.key}
          nodeValue={state.selectedNode.value}
          existingMetadata={state.metadata[state.selectedNode.key]}
        />
      )}
    </div>
  ) : (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Upload Files</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Steps Upload */}
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
            state.steps
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400'
          }`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'steps')}
          onClick={() => stepsInputRef.current?.click()}
        >
          <input
            ref={stepsInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => handleFileInputChange(e, 'steps')}
          />
          <div className="space-y-1.5">
            <svg
              className="mx-auto h-8 w-8 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {state.steps ? (
                <p className="text-green-500 dark:text-green-400">{state.steps.name}</p>
              ) : (
                <>
                  <p>Drag and drop your Steps JSON file here</p>
                  <p className="text-xs mt-0.5">or click to select</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Scribe Upload */}
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
            state.scribe
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400'
          }`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'scribe')}
          onClick={() => scribeInputRef.current?.click()}
        >
          <input
            ref={scribeInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => handleFileInputChange(e, 'scribe')}
          />
          <div className="space-y-1.5">
            <svg
              className="mx-auto h-8 w-8 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {state.scribe ? (
                <p className="text-green-500 dark:text-green-400">{state.scribe.name}</p>
              ) : (
                <>
                  <p>Drag and drop your Scribe PDF file here</p>
                  <p className="text-xs mt-0.5">or click to select</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Advance Button */}
      <div className="mt-6 flex flex-col items-center gap-2">
        {!state.scribe && (
          <p className="text-yellow-600 dark:text-yellow-400 text-xs">
            Note: PDF file is optional for now
          </p>
        )}
        <button
          onClick={handleAdvance}
          disabled={!state.steps}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            state.steps
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          Advance
        </button>
      </div>
    </div>
  )

  return (
    <Layout>
      {content}
    </Layout>
  )
}