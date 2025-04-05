"use client"
 import { useState, useEffect } from "react"
 import Link from "next/link"
 import axios from "axios"
 import {
  Shield,
  Bell,
  User,
  LogOut,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Filter,
  Search,
  Phone,
  Ambulance,
  FileText,
  ArrowUpRight,
 } from "lucide-react"
 import { Button } from "@/components/ui/button"
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 
"@/components/ui/card"
 import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
 import { Badge } from "@/components/ui/badge"
 import { Input } from "@/components/ui/input"
 import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
 } from "@/components/ui/dropdown-menu"
 import { useComplaintStore } from "../../../lib/stores/complaintStore"
 // Define the Complaint interface based on the properties being used
 interface Complaint {
  id: string
  description: string
  locationAddress: string
  createdAt: Date | string
  Resolved?: boolean
  ActionTaken?: boolean
  PoliceAssigned?: boolean
  PoliceDispatched?: boolean
  PoliceArrived?: boolean
  voicemailReceived?: boolean
 }
 export default function PoliceDashboardPage() {
  const [activeTab, setActiveTab] = useState("urgent")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState("list")
  const { complaints } = useComplaintStore()
  const [firData, setFirData] = useState<any[]>([]) // State to store FIR data
  // Fetch FIR data from the API
  const fetchFIRData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/getComplaints")
      const cids = response.data.cids
      // Fetch details for each CID from IPFS
      const firDetails = await Promise.all(
        cids.map(async (cid: string) => {
          const ipfsResponse = await axios.get(`https://ipfs.io/ipfs/${cid}`)
          return ipfsResponse.data
        })
      )
      setFirData(firDetails)
    } catch (error) {
      console.error("Error fetching FIR data:", error)
    }
  }
  useEffect(() => {
    fetchFIRData()
  }, [])
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">DeFIR</span>
          </div>
        </div>
      </header>
      <main className="container px-4 md:px-6 py-8">
        <div className="grid gap-8">
          {/* Total FIRs Section */}
          <Card>
            <CardHeader>
              <CardTitle>Total FIRs</CardTitle>
              <CardDescription>
                The total number of FIRs currently available in the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{firData.length}</p>
            </CardContent>
          </Card>
          {/* FIR Details Section */}
          <Card>
            <CardHeader>
              <CardTitle>FIR Details</CardTitle>
              <CardDescription>Fetched from IPFS</CardDescription>
            </CardHeader>
            <CardContent>
              {firData.length === 0 ? (
                <p>No FIR data available</p>
              ) : (
                firData.map((fir, index) => (
                  <div key={index} className="mb-4">
                    <h3 className="text-lg font-bold">Tracking ID: 
{fir.trackingId}</h3>
                    <p><strong>Description:</strong> {fir.description}</p>
                    <p><strong>Location:</strong> {fir.locationAddress}</p>
                    <p><strong>Evidence Files:</strong></p>
                    <ul>
                      {fir.evidenceFiles.map((file: string, idx: number) => (
                        <li key={idx}>
                          <a
                            href={`https://ipfs.io/ipfs/${file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline"
                          >
                            {file}
                          </a>
                        </li>
                      ))}
                    </ul>
                    <p><strong>Evidence Description:</strong> 
{fir.evidenceDescription}</p>
                    <p><strong>Contact Name:</strong> {fir.contactName}</p>
                    <p><strong>Contact Email:</strong> {fir.contactEmail}</p>
                    <p><strong>Created At:</strong> {new 
Date(fir.createdAt).toLocaleString()}</p>
                    <p><strong>Complaint Type:</strong> {fir.complaintType}</p>
                    <p><strong>Voicemail Received:</strong> {fir.voicemailReceived ?
 "Yes" : "No"}</p>
                    <p><strong>AI Processing Completed:</strong> 
{fir.AIProcessingCompleted ? "Yes" : "No"}</p>
                    <p><strong>Police Assigned:</strong> {fir.PoliceAssigned ? "Yes"
 : "No"}</p>
                    <p><strong>Police Dispatched:</strong> {fir.PoliceDispatched ? 
"Yes" : "No"}</p>
                    <p><strong>Police Arrived:</strong> {fir.PoliceArrived ? "Yes" :
 "No"}</p>
                    <p><strong>Action Taken:</strong> {fir.ActionTaken ? "Yes" : 
"No"}</p>
                    <p><strong>Resolved:</strong> {fir.Resolved ? "Yes" : "No"}</p>
                    <hr className="my-4" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
 }