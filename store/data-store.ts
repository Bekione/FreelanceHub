import { create } from "zustand"

export interface Project {
  id: string
  title: string
  description: string
  status: "active" | "completed" | "pending"
  deadline: string
  client: string
  budget: number
}

export interface Invoice {
  id: string
  amount: number
  client: string
  status: "paid" | "pending" | "overdue"
  dueDate: string
  issueDate: string
}

export interface Client {
  id: string
  name: string
  email: string
  company: string
  phone: string
}

interface DataState {
  projects: Project[]
  invoices: Invoice[]
  clients: Client[]
  isLoading: boolean
  addProject: (project: Omit<Project, "id">) => void
  addClient: (client: Omit<Client, "id">) => void
  updateProject: (id: string, project: Partial<Project>) => void
  updateClient: (id: string, client: Partial<Client>) => void
  fetchData: () => Promise<void>
}

// Mock data
const mockProjects: Project[] = [
  {
    id: "1",
    title: "E-commerce Website",
    description: "Modern e-commerce platform with React and Node.js",
    status: "active",
    deadline: "2024-02-15",
    client: "TechCorp Inc.",
    budget: 5000,
  },
  {
    id: "2",
    title: "Mobile App Design",
    description: "UI/UX design for fitness tracking mobile application",
    status: "completed",
    deadline: "2024-01-20",
    client: "FitLife Solutions",
    budget: 3000,
  },
  {
    id: "3",
    title: "Brand Identity",
    description: "Complete brand identity package including logo and guidelines",
    status: "pending",
    deadline: "2024-03-01",
    client: "StartupXYZ",
    budget: 2500,
  },
]

const mockInvoices: Invoice[] = [
  {
    id: "INV-001",
    amount: 5000,
    client: "TechCorp Inc.",
    status: "pending",
    dueDate: "2024-02-01",
    issueDate: "2024-01-15",
  },
  {
    id: "INV-002",
    amount: 3000,
    client: "FitLife Solutions",
    status: "paid",
    dueDate: "2024-01-25",
    issueDate: "2024-01-10",
  },
  {
    id: "INV-003",
    amount: 1200,
    client: "StartupXYZ",
    status: "overdue",
    dueDate: "2024-01-20",
    issueDate: "2024-01-05",
  },
]

const mockClients: Client[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@techcorp.com",
    company: "TechCorp Inc.",
    phone: "+1 (555) 123-4567",
  },
  {
    id: "2",
    name: "Mike Chen",
    email: "mike@fitlife.com",
    company: "FitLife Solutions",
    phone: "+1 (555) 987-6543",
  },
  {
    id: "3",
    name: "Emily Davis",
    email: "emily@startupxyz.com",
    company: "StartupXYZ",
    phone: "+1 (555) 456-7890",
  },
]

export const useDataStore = create<DataState>((set, get) => ({
  projects: [],
  invoices: [],
  clients: [],
  isLoading: false,

  fetchData: async () => {
    set({ isLoading: true })

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    set({
      projects: mockProjects,
      invoices: mockInvoices,
      clients: mockClients,
      isLoading: false,
    })
  },

  addProject: (project) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
    }
    set((state) => ({
      projects: [...state.projects, newProject],
    }))
  },

  addClient: (client) => {
    const newClient: Client = {
      ...client,
      id: Date.now().toString(),
    }
    set((state) => ({
      clients: [...state.clients, newClient],
    }))
  },

  updateProject: (id, updatedProject) => {
    set((state) => ({
      projects: state.projects.map((project) => (project.id === id ? { ...project, ...updatedProject } : project)),
    }))
  },

  updateClient: (id, updatedClient) => {
    set((state) => ({
      clients: state.clients.map((client) => (client.id === id ? { ...client, ...updatedClient } : client)),
    }))
  },
}))
