export interface Task {
    id: number
    taskName: string
    description: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH'
    project: string
    deadline: string
    timeRequired: string
  }