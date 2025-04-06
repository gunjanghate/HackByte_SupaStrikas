"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState, useEffect, JSX } from "react"
import { Menu, Shield, X } from "lucide-react"
import { ethers, N } from "ethers"
import PoliceWalletManager from "../../artifacts/contracts/PoliceWalletManager.sol/PoliceWalletManager.json"
import Image from "next/image"
import logo from "../public/logo.png"
declare global {
  interface Window {
    ethereum: any;
  }
}

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentAccount, setCurrentAccount] = useState("")
  const [userRole, setUserRole] = useState<"owner" | "police" | "citizen" | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const initialize = async () => {
      if (typeof window.ethereum !== "undefined" && CONTRACT_ADDRESS) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            await checkUserRole(accounts[0])
            console.log("User role:", userRole)
          }
        } catch (error) {
          console.error("Initial connection error:", error)
        }
      }
    }
    initialize()
  }, [])

  const checkUserRole = async (address: string) => {
    if (!CONTRACT_ADDRESS) {
      console.error("Contract address not configured")
      return
    }

    try {
      setLoading(true)
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        PoliceWalletManager.abi,
        provider
      )

      // Verify contract connection
      const owner = await contract.owner()
      if (!ethers.isAddress(owner)) {
        throw new Error("Invalid owner address returned from contract")
      }

      const isPolice = await contract.isPolice(address)

      setCurrentAccount(address)
      setUserRole(address.toLowerCase() === owner.toLowerCase() ? "owner" : isPolice ? "police" : "citizen")

    } catch (error) {
      console.error("Role check failed:", error)
      alert("Error connecting to contract. Please check network and try again.")
      setUserRole(null)
      setCurrentAccount("")
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (typeof window.ethereum === "undefined") {
      alert("Please install MetaMask!")
      return
    }

    if (!CONTRACT_ADDRESS) {
      alert("Contract not configured")
      return
    }

    try {
      setLoading(true)
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      await checkUserRole(accounts[0])
      redirectToDashboard()
    } catch (error) {
      console.error("Connection error:", error)
      alert("Wallet connection failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const redirectToDashboard = () => {
    if (!userRole) return

    const routes = {
      owner: "/owner/dashboard",
      police: "/police/dashboard",
      citizen: "/user/dashboard"
    }

    window.location.href = routes[userRole]
  }

  return (
    <header className=" border-2 border-green-900 mx-24 rounded-2xl backdrop-blur-3xl bg-transparent fixed top-3 md:top-5 left-0 right-0  z-50 shadow-xl">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">

      <Link href="/" className="flex items-center gap-2">
       <Image src={logo} alt="logo" width={40} height={40}/>
        <span className="text-3xl font-extrabold tracking-tighter text-[#191A23]">De<span className="text-green-600">FIR</span></span>
      </Link>

      <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <nav className="hidden md:flex items-center gap-6">
        <Link href="/verify" className="text-[#191A23] font-medium transition-colors">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all">
            Make Complaint
          </button>
        </Link>
        <Link href="/complaints/track" className="text-[#191A23] font-medium hover:text-[#85d088] transition-colors">
        Track Complaint
        </Link>
        {/* <Button
        variant="outline"
        onClick={handleLogin}
        className="border-[#191A23] text-[#191A23] hover:bg-[#B9FF66] hover:text-[#191A23] hover:border-[#B9FF66]"
        >
        {currentAccount ? ${currentAccount.slice(0, 6)}... : "Login"}
        </Button> */}
      </nav>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="absolute top-20 left-0 right-0 bg-white z-50 border-b border-[#F3F3F3] md:hidden">
        <div className="flex flex-col p-4 space-y-4">
          <Link href="/about" className="text-[#191A23] hover:text-[#B9FF66] transition-colors">
          About us
          </Link>
          <Link href="/services" className="text-[#191A23] hover:text-[#B9FF66] transition-colors">
          Services
          </Link>
          <Link href="/use-cases" className="text-[#191A23] hover:text-[#B9FF66] transition-colors">
          Use Cases
          </Link>
          <Link href="/pricing" className="text-[#191A23] hover:text-[#B9FF66] transition-colors">
          Pricing
          </Link>
          <Link href="/blog" className="text-[#191A23] hover:text-[#B9FF66] transition-colors">
          Blog
          </Link>
          <Button
          variant="outline"
          className="border-[#191A23] text-[#191A23] hover:bg-[#B9FF66] hover:text-[#191A23] hover:border-[#B9FF66]"
          >
          Request a quote
          </Button>
        </div>
        </div>
      )}
      </div>
    </header>
  )
}