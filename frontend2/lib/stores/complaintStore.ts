// store/complaintStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Complaint {
  id: string
  trackingId: string
  description: string
  locationAddress: string
  evidenceFiles: string[]
  evidenceDescription: string
  contactName: string
  contactEmail: string
  createdAt: Date
  voicemailReceived: boolean
  AIProcessingCompleted: boolean
  PoliceAssigned: boolean
  PoliceDispatched: boolean
  PoliceArrived: boolean
  ActionTaken: boolean
  Resolved: boolean
}

interface ComplaintState {
  complaints: Complaint[]
  evidenceCache: Record<string, File> // CID -> File mapping
  addComplaint: (complaint: Omit<Complaint, 'id' | 'createdAt'>) => void
  fetchComplaints: () => Promise<void>
}

export const useComplaintStore = create<ComplaintState>()(
    persist(
      (set, get) => ({
        complaints: [],
        evidenceCache: {},
        
        addComplaint: (newComplaint) => {
          const complaintWithId: Complaint = {
            ...newComplaint,
            id: `COMP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            createdAt: new Date(),
          }
          set((state) => ({
            complaints: [...state.complaints, complaintWithId]
          }))
        },
  
        fetchComplaints: async () => {
          try {
            const response = await fetch('http://localhost:5000/getComplaints') // returns { cids: [...] }
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        
            const { cids } = await response.json()
            if (!Array.isArray(cids)) throw new Error('Invalid CID array')
        
            const allFIRs = await Promise.all(
              cids.map(async (cid: string) => {
                try {
                  const res = await fetch(`https://${cid}.ipfs.dweb.link`)
                  if (!res.ok) throw new Error('Failed to fetch IPFS data')
                  const data = await res.json()
                console.log("Fetched data:", data)
        
                  // Load evidence files if needed
                  const evidenceFiles = await Promise.all(
                    (data.evidenceFiles || []).map(async (cid: string) => {
                      if (!get().evidenceCache[cid]) {
                        const fileRes = await fetch(`https://${cid}.ipfs.dweb.link`)
                        if (!fileRes.ok) return cid
        
                        const blob = await fileRes.blob()
                        const fileType = fileRes.headers.get('content-type') || 'application/octet-stream'
                        const file = new File([blob], `evidence-${cid}`, { type: fileType })
        
                        set((state) => ({
                          evidenceCache: { ...state.evidenceCache, [cid]: file }
                        }))
                      }
                      return cid
                    })
                  )
        
                  return {
                    ...data,
                    id: data.trackingId,
                    evidenceFiles,
                    createdAt: new Date(data.createdAt || Date.now())
                  } as Complaint
                } catch (err) {
                  console.error("Error loading from CID:", cid, err)
                  return null
                }
              })
            )
        
            const filtered = allFIRs.filter(Boolean) as Complaint[]
        
            set((state) => ({
              complaints: [
                ...filtered.filter(fc => !state.complaints.find(sc => sc.trackingId === fc.trackingId)),
                ...state.complaints
              ]
            }))
          } catch (err) {
            console.error("Failed to fetch FIRs from Pinata:", err)
          }
        }
        
      }),
      {
        name: 'complaint-storage'
      }
    )
  )