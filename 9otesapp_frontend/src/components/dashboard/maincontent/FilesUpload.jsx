"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import fetchInstance from "../../FetchInstance.js"
import FileUrlsComp from "./FileUrlsComp.jsx"
import { UploadCloud, ArrowLeft } from "lucide-react"
import Swal from "sweetalert2"
import { baseUrl } from "../dashboardindex.js"

export default function FilesUpload() {
    const { unitid, topicid } = useParams()
    const storedUser = sessionStorage.getItem("user")
    const { email, password } = JSON.parse(storedUser)
    const credentials = btoa(`${email}:${password}`)

    const [topicData, setTopicData] = useState({})
    const [file, setFile] = useState(null)
    const [folderName, setFolderName] = useState("")
    const [comment, setComment] = useState("")
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState("")
    const [dragActive, setDragActive] = useState(false)

    useEffect(() => {
        const fetchTopicData = async () => {
            try {
                const data = await fetchInstance(`${baseUrl}/api/${unitid}/gettopicdata/${topicid}`, { method: "GET" })
                setTopicData(data)
            } catch (err) {
                console.error("Error fetching topic data:", err)
            }
        }
        fetchTopicData()
    }, [unitid, topicid]) // Added unitid and topicid as dependencies

    useEffect(() => {
        if (topicData) {
            setFolderName(`${email}folder`)
        }
    }, [topicData, email]) // Added email as a dependency

    const handleDragOver = (e) => {
        e.preventDefault()
        setDragActive(true)
    }

    const handleDragLeave = () => {
        setDragActive(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragActive(false)
        if (e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0])
        }
    }

    const uploadFile = async () => {
        if (!file) {
            Swal.fire({
                icon: "warning",
                title: "No File Selected",
                text: "Please select a file to upload!",
                confirmButtonColor: "#6366F1",
            })
            return
        }
        if (!comment.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Missing Comment",
                text: "Please enter a comment for the file upload!",
                confirmButtonColor: "#6366F1",
            })
            return
        }

        setUploading(true)
        setError("")

        const formData = new FormData()
        formData.append("file", file)
        formData.append("topicId", topicid)
        formData.append("folderName", folderName)
        formData.append("comment", comment)

        try {
            const response = await fetch(`${baseUrl}/api/drive/upload`, {
                method: "POST",
                headers: { Authorization: `Basic ${credentials}` },
                body: formData,
                credentials: "include",
            })

            const data = await response.json()

            if (!response.ok) throw new Error(data.error || "Upload failed!")

            setComment("")
            fetchFileUrls()

            Swal.fire({
                icon: "success",
                title: "Upload Successful!",
                text: "Your file has been uploaded successfully.",
                confirmButtonColor: "#22C55E",
            })
        } catch (error) {
            console.error("Upload error:", error)
            setError("File upload failed. Please try again.")

            Swal.fire({
                icon: "error",
                title: "Upload Failed",
                text: "File upload failed. Please try again.",
                confirmButtonColor: "#EF4444",
            })
        } finally {
            setUploading(false)
        }
    }

    const [fileUrls, setFileUrls] = useState([])
    const [loading, setLoading] = useState(true)
    const [error1, setError1] = useState(null)

    const fetchFileUrls = async () => {
        try {
            const data = await fetchInstance(`${baseUrl}/api/drive/getUrls/${topicid}`, {
                method: "GET",
            })
            setFileUrls(data)
            // eslint-disable-next-line no-unused-vars
        } catch (error1) {
            setError1("Failed to load file URLs.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchFileUrls()
    }, [topicid]) // Removed fetchFileUrls as a dependency

    return (
        <div className="flex-1 p-4 md:p-8 bg-white bg-opacity-60 backdrop-blur-lg shadow-lg rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-300">
            <div className="mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Subject Title */}
                <div className="bg-gradient-to-r from-indigo-700 to-blue-500 p-4 md:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-12">
                    {/* Topic Title */}
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide text-center sm:text-left flex-1">
                        {topicData.subjectName} <span className="text-3xl md:text-4xl font-extrabold">/</span> {topicData.unitName}
                        <span className="text-3xl md:text-4xl font-extrabold"> / </span> {topicData.topicName}
                    </h1>

                    {/* Back Button */}
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-300 text-gray-900 font-semibold rounded-full px-4 md:px-6 py-2 md:py-3 border border-gray-400 shadow-md transition-all duration-300 hover:from-gray-200 hover:to-gray-400 hover:scale-105 active:scale-95 w-full sm:w-auto"
                    >
                        <ArrowLeft size={20} className="text-gray-700" />
                        <span className="text-base md:text-lg">Go Back</span>
                    </button>
                </div>

                {/* Upload Container */}
                <div className="bg-gradient-to-r from-indigo-600/10 to-blue-500/10 p-4 md:p-6 rounded-lg shadow-md flex flex-col items-center gap-4">
                    {/* Drag & Drop Input */}
                    <div
                        className={`w-full p-4 md:p-5 border-2 rounded-lg cursor-pointer flex flex-col items-center justify-center transition ${
                            dragActive ? "border-blue-500 bg-blue-100/30" : "border-gray-300 border-dashed"
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <p className="text-gray-700 font-medium">Drag & Drop your file here</p>
                        <p className="text-gray-500 text-sm">or</p>
                        <label className="cursor-pointer text-blue-600 font-semibold hover:underline">
                            Click to select a file
                            <input type="file" onChange={(e) => setFile(e.target.files[0])} className="hidden" />
                        </label>
                        {file && <p className="mt-2 text-sm text-gray-800 break-all text-center">{file.name}</p>}
                    </div>

                    {/* Centered Input and Button */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                        {/* Description Input */}
                        <input
                            type="text"
                            placeholder="Enter file comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full sm:w-2/3 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                            required
                        />

                        {/* Upload Button */}
                        <button
                            onClick={uploadFile}
                            disabled={uploading}
                            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-semibold transition duration-200 w-full sm:w-auto ${
                                uploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                            }`}
                        >
                            <UploadCloud size={20} className={uploading ? "text-gray-300" : "text-white"} />
                            {uploading ? "Uploading..." : "Upload"}
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && <p className="text-red-600 font-medium">{error}</p>}

                    <FileUrlsComp topicId={topicid} fileUrls={fileUrls} loading={loading} error={error1} />
                </div>
            </div>
        </div>
    )
}

