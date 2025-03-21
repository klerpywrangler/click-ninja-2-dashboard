import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useToast } from './ui/use-toast'
import Layout from './Layout'

interface Record {
  id: string
  title: string
  description: string
  createdAt: string
  updatedAt: string
}

const fetchRecords = async () => {
//   const response = await axios.get<Record[]>(import.meta.env.VITE_API_URL)
const response = {
    data: [
        {
            id: '1',
            title: 'Record 1',
            description: 'Description 1',
            createdAt: '2021-01-01',
            updatedAt: '2021-01-01',
        },
        {
            id: '2',
            title: 'Record 2',
            description: 'Description 2',
            createdAt: '2021-01-01',
            updatedAt: '2021-01-01',
        },
        {
            id: '3',
            title: 'Record 3',
            description: 'Description 3',
            createdAt: '2021-01-01',
            updatedAt: '2021-01-01',
        }
    ],
  }
  return response.data
}

export default function Dashboard() {
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null)
  const { toast } = useToast()

  const { data: records = [], isLoading, error } = useQuery<Record[], Error>({
    queryKey: ['records'],
    queryFn: fetchRecords,
  })

  if (error) {
    toast({
      title: 'Error',
      description: 'Failed to fetch records',
      variant: 'destructive',
    })
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-full items-center justify-center">
          <div className="text-lg text-gray-900 dark:text-white">Loading...</div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="flex h-full items-center justify-center">
          <div className="text-lg text-red-500">Error loading records</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Records</h2>
        <div className="space-y-4">
          {records.map((record: Record) => (
            <div
              key={record.id}
              onClick={() => setSelectedRecord(record)}
              className={`rounded-lg p-4 cursor-pointer transition-colors ${
                selectedRecord?.id === record.id
                  ? 'bg-gray-200 dark:bg-gray-700'
                  : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{record.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{record.description}</p>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                <p>Created: {new Date(record.createdAt).toLocaleDateString()}</p>
                <p>Updated: {new Date(record.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}