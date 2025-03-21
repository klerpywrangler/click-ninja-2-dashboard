import { useState, useEffect } from 'react'

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

interface ValueNodeModalProps {
  isOpen: boolean
  onClose: () => void
  onAddInstructions: (instructions: string) => void
  onAddRestrictions: (restrictions: Restriction) => void
  nodeKey: string
  nodeValue: unknown
  existingMetadata?: NodeMetadata
}

const getInitialType = (value: unknown): Restriction => {
  const type = typeof value === 'number'
    ? 'number'
    : typeof value === 'boolean'
      ? 'boolean'
      : value instanceof Date
        ? 'date'
        : 'string'

  return {
    type,
    validValues: [],
  }
}

export default function ValueNodeModal({
  isOpen,
  onClose,
  onAddInstructions,
  onAddRestrictions,
  nodeKey,
  nodeValue,
  existingMetadata,
}: ValueNodeModalProps) {
  const [activeTab, setActiveTab] = useState<'instructions' | 'restrictions'>('instructions')
  const [instructions, setInstructions] = useState(existingMetadata?.instructions || '')
  const [restrictions, setRestrictions] = useState<Restriction>(
    existingMetadata?.restrictions || getInitialType(nodeValue)
  )

  useEffect(() => {
    if (isOpen) {
      setInstructions(existingMetadata?.instructions || '')
      setRestrictions(existingMetadata?.restrictions || getInitialType(nodeValue))
    }
  }, [isOpen, nodeKey, existingMetadata, nodeValue])

  const handleSave = () => {
    if (activeTab === 'instructions') {
      onAddInstructions(instructions)
    } else {
      onAddRestrictions(restrictions)
    }
    onClose()
  }

  if (!isOpen) return null

  const showMinMax = restrictions.type === 'number' || restrictions.type === 'string'

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Edit Node: {nodeKey}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('instructions')}
                className={`border-b-2 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'instructions'
                    ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
                }`}
              >
                Instructions
              </button>
              <button
                onClick={() => setActiveTab('restrictions')}
                className={`border-b-2 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'restrictions'
                    ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
                }`}
              >
                Restrictions
              </button>
            </nav>
          </div>

          <div className="mb-6">
            {activeTab === 'instructions' ? (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Instructions
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  rows={4}
                  placeholder="Enter instructions for this node..."
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Type
                  </label>
                  <select
                    value={restrictions.type}
                    onChange={(e) => setRestrictions({ ...restrictions, type: e.target.value })}
                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  >
                    <option value="number">Number</option>
                    <option value="string">String</option>
                    <option value="enum">Enum</option>
                  </select>
                </div>

                {showMinMax && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Min
                      </label>
                      <input
                        type={restrictions.type === 'number' ? 'number' : 'text'}
                        value={restrictions.min ?? ''}
                        onChange={(e) =>
                          setRestrictions({
                            ...restrictions,
                            min: restrictions.type === 'number' ? Number(e.target.value) : e.target.value.length,
                          })
                        }
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
                        placeholder={restrictions.type === 'number' ? '0' : '0'}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Max
                      </label>
                      <input
                        type={restrictions.type === 'number' ? 'number' : 'text'}
                        value={restrictions.max ?? ''}
                        onChange={(e) =>
                          setRestrictions({
                            ...restrictions,
                            max: restrictions.type === 'number' ? Number(e.target.value) : e.target.value.length,
                          })
                        }
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
                        placeholder={restrictions.type === 'number' ? '100' : '100'}
                      />
                    </div>
                  </div>
                )}

                {restrictions.type === 'enum' && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Valid Values
                    </label>
                    <input
                      type="text"
                      value={restrictions.validValues?.join(', ') || ''}
                      onChange={(e) =>
                        setRestrictions({
                          ...restrictions,
                          validValues: e.target.value.split(',').map((v) => v.trim()),
                        })
                      }
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
                      placeholder="Enter values separated by commas"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}