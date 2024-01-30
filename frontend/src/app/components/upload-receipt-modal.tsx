import { useCallback, useEffect, useState } from 'react'

import { XMarkIcon } from '@heroicons/react/24/outline'
import { ArrowUpOnSquareIcon } from '@heroicons/react/24/outline'
import axios from 'axios'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'

import Modal from '../../components/ui/modal'

export default function UploadReceiptModal({
  selectedOrder,
  onClose,
}: {
  selectedOrder: any
  onClose: any
}) {
  const [selectedEmls, setSelectedEmls] = useState([])
  // Add this
  const [uploadStatus, setUploadStatus] = useState('')
  const onDrop = useCallback((acceptedFiles: any) => {
    //console.log('Files dragged and dropped ', acceptedFiles)
    acceptedFiles.forEach((file: any) => {
      console.log(file)
      setSelectedEmls((prevState): any => [...prevState, file])
    })
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'message/rfc822': ['.eml'],
    },
  })
  const onUpload = async () => {
    const toasId = toast.loading('Uploading proof of payment...')
    const formData = new FormData()
    selectedEmls.forEach((image) => {
      console.log(selectedOrder)
      formData.append('orderId', selectedOrder.id)
      formData.append('file', image)
    })
    try {
      const response = await axios.post('/api/prove', formData)
      console.log(response.data)
      setUploadStatus('upload successful')

      toast.dismiss(toasId)
      toast.success('Proof of payment uploaded successfully!')
    } catch (error) {
      console.log('imageUpload' + error)
      toast.dismiss(toasId)
      toast.error('Upload failed!')
    }

    onClose()
  }
  useEffect(() => {
    const handlePaste = (event: any) => {
      const items = (event.clipboardData || event.originalEvent.clipboardData).items
      for (const item of items) {
        if (item.kind === 'file') {
          const file = item.getAsFile()
          // If file
          console.log(file)
        } else if (item.kind === 'string') {
          item.getAsString((string: string) => {
            // If string
            console.log(string)
          })
        }
      }
    }

    window.addEventListener('paste', handlePaste)

    // Cleanup the event listener
    return () => {
      window.removeEventListener('paste', handlePaste)
    }
  }, [])

  if (!selectedOrder) return null
  return (
    <Modal>
      <div className="inline-flex flex-col items-center justify-center gap-4 rounded-md bg-zinc-950 p-6">
        <div className="flex h-6 flex-col items-end justify-center gap-2.5 self-stretch">
          <div className="inline-flex items-center justify-center gap-2">
            <div className="relative" />
            <div
              className="flex items-center justify-center gap-2.5 hover:cursor-pointer"
              onClick={onClose}
            >
              <XMarkIcon className="h-4 w-4 text-zinc-300" />
              <div className="text-center font-manrope text-base font-semibold leading-normal text-zinc-300">
                Close
              </div>
            </div>
          </div>
        </div>
        <div className="font-manrope text-2xl font-extrabold leading-loose text-white">
          Upload Payment Receipts
        </div>
        <div className="self-stretch text-center font-manrope text-base font-normal leading-normal text-zinc-300">
          Upload your receipt to prove an payment
        </div>

        <div
          {...getRootProps()}
          className="flex cursor-pointer flex-col items-center justify-start gap-1 self-stretch rounded-md border-2 border-dashed border-zinc-600 px-[26px] pb-[26px] pt-[22px]"
        >
          <input {...getInputProps()} />
          <div className="relative flex h-12 w-12 items-center justify-center">
            <ArrowUpOnSquareIcon className="absolute h-8 w-8 text-zinc-300" />
          </div>
          {isDragActive ? (
            <div className="mb-[10px]">Drop the file(s) to upload</div>
          ) : (
            <>
              <div className="inline-flex items-center justify-start gap-1">
                <div className="flex items-center justify-start rounded-md">
                  <div className="font-inter text-sm font-medium leading-tight text-lime-300">
                    Upload a file
                  </div>
                </div>
                <div className="font-inter text-sm font-medium leading-tight text-zinc-300">
                  or drag and drop
                </div>
              </div>
              <div className="text-center font-inter text-xs font-normal leading-none text-zinc-400">
                .EML
              </div>
            </>
          )}
          <div></div>
        </div>

        {selectedEmls.length > 0 && (
          <>
            {selectedEmls.map((file: any, index) => (
              <div key={index}>
                <p className="font-inter text-xl font-medium leading-tight text-lime-300">
                  {file.path}
                </p>
              </div>
            ))}
            <button
              className="h-10 rounded bg-primary px-4 py-2 font-bold text-primary-foreground hover:bg-primary/90"
              onClick={onUpload}
            >
              Upload
            </button>
          </>
        )}
        {/* <div className="self-stretch text-center font-manrope text-base font-normal leading-normal text-zinc-300">
          Or
        </div>
        <div className="self-stretch text-center font-manrope text-base font-normal leading-normal text-zinc-300">
          Copy and paste the content of the email that prove an payment
        </div>
        <div className="flex flex-col items-start justify-start gap-1 self-stretch rounded border border-zinc-800 bg-zinc-900 px-4 py-5">
          <div className="self-stretch font-manrope text-base font-medium leading-normal text-zinc-400">
            Email content
          </div>
          <div className="inline-flex items-center justify-start gap-1 self-stretch px-1.5 py-2">
            <div className="shrink grow basis-0 font-manrope text-base font-normal leading-tight text-zinc-500">
              Paste content of the email that prove your payment here...
            </div>
          </div>
        </div> */}
      </div>
    </Modal>
  )
}
