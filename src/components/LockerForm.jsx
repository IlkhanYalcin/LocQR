import { lockerOptions } from "../utils"
import { useState } from 'react'
import Modal from "./Modal"
import Authentication from "./Authentication"
import { useAuth } from "../context/AuthContext"
import { doc, setDoc } from "firebase/firestore"
import { db } from "../../firebase"

export default function LockerForm(props) {
    const { isAuthenticated } = props
    const [showModal, setShowModal] = useState(false)
    const [selectedCoffee, setSelectedCoffee] = useState(null)
    const [showCoffeeTypes, setShowCoffeeTypes] = useState(false)
    const [coffeeCost, setCoffeeCost] = useState(0)
    const [hour, setHour] = useState(0)
    const [min, setMin] = useState(0)
    const [isLocked, setIsLocked] = useState(false)
    const [showQRScanner, setShowQRScanner] = useState(false)

    const { globalData, setGlobalData, globalUser } = useAuth()

    async function handleSubmitForm() {
        if (!isAuthenticated) {
            setShowModal(true)
            return
        }

        // define a guard clause that only submits the form if it is completed
        if (!selectedCoffee) {
            return
        }

        try {
            // then we're going to create a new data object
            const newGlobalData = {
                ...(globalData || {})
            }

            const nowTime = Date.now()
            const timeToSubtract = (hour * 60 * 60 * 1000) + (min * 60 * 1000)
            const timestamp = nowTime - timeToSubtract

            const newData = {
                name: selectedCoffee,
                cost: coffeeCost
            }
            newGlobalData[timestamp] = newData
            console.log(timestamp, selectedCoffee, coffeeCost)

            // update the global state
            setGlobalData(newGlobalData)

            // persist the data in the firebase firestore
            const userRef = doc(db, 'users', globalUser.uid)
            const res = await setDoc(userRef, {
                [timestamp]: newData
            }, { merge: true })

            setSelectedCoffee(null)
            setHour(0)
            setMin(0)
            setCoffeeCost(0)
        } catch (err) {
            console.log(err.message)
        }
    }

    function handleCloseModal() {
        setShowModal(false)
    }

    function handleToggleLock() {
        if (!isAuthenticated) {
            setShowModal(true)
            return
        }
        setIsLocked(!isLocked)
    }

    function handleScanQR() {
        if (!isAuthenticated) {
            setShowModal(true)
            return
        }
        setShowQRScanner(true)
        // QR scanning logic will be implemented later
    }

    return (
        <>
            {showModal && (
                <Modal handleCloseModal={handleCloseModal}>
                    <Authentication handleCloseModal={handleCloseModal} />
                </Modal>
            )}
            <div className="section-header">
                <i className="fa-solid fa-lock" />
                <h2>Locker Control</h2>
            </div>
            
            <div className="locker-controls">
                <button 
                    onClick={handleScanQR}
                    className="button-card fanta-button-primary"
                >
                    <i className="fa-solid fa-qrcode" />
                    <h4>Scan QR Code</h4>
                </button>

                <button 
                    onClick={handleToggleLock}
                    className={`button-card ${isLocked ? 'fanta-button-danger' : 'fanta-button-success'}`}
                >
                    <i className={`fa-solid fa-${isLocked ? 'lock' : 'unlock'}`} />
                    <h4>{isLocked ? 'Unlock' : 'Lock'}</h4>
                </button>
            </div>

            {showQRScanner && (
                <div className="qr-scanner">
                    <h4>QR Scanner Placeholder</h4>
                    <p>QR scanning functionality will be implemented here</p>
                    <button 
                        onClick={() => setShowQRScanner(false)}
                        className="fanta-button-secondary"
                    >
                        Close Scanner
                    </button>
                </div>
            )}
        </>
    )
}