import React, { useEffect, useState } from 'react'
import Nav from './Nav'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl, getSocket } from '../App'
import DeliveryBoyTracking from './DeliveryBoyTracking'
import { ClipLoader } from 'react-spinners'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { setCurrentCity } from '../redux/userSlice'

function DeliveryBoy() {
  const {userData,currentCity}=useSelector(state=>state.user)
  const socket = getSocket()
  const dispatch = useDispatch()
  const [currentOrder,setCurrentOrder]=useState()
  const [showOtpBox,setShowOtpBox]=useState(false)
  const [availableAssignments,setAvailableAssignments]=useState(null)
  const [otp,setOtp]=useState("")
  const [todayDeliveries,setTodayDeliveries]=useState([])
const [deliveryBoyLocation,setDeliveryBoyLocation]=useState(null)
const [loading,setLoading]=useState(false)
const [message,setMessage]=useState("")
const [manualLatitude,setManualLatitude]=useState("")
const [manualLongitude,setManualLongitude]=useState("")
const [manualCity,setManualCity]=useState(currentCity || "")
const [locationMessage,setLocationMessage]=useState("")

  useEffect(()=>{
    setManualCity(currentCity || "")
  },[currentCity])

  const updateLocation = async (latitude, longitude, cityName) => {
    try {
      await axios.post(`${serverUrl}/api/user/update-location`, {
        lat: latitude,
        lon: longitude
      }, { withCredentials: true })

      setDeliveryBoyLocation({ lat: latitude, lon: longitude })
      if (cityName && cityName.trim()) {
        const trimmedCity = cityName.trim()
        localStorage.setItem('preferredCity', trimmedCity)
        dispatch(setCurrentCity(trimmedCity))
      }
      setLocationMessage('Location updated successfully')
    } catch (error) {
      setLocationMessage('Could not update location')
      console.log(error)
    }
  }

  const handleUseBrowserLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Browser location is not supported')
      return
    }

    navigator.geolocation.getCurrentPosition((position) => {
      updateLocation(position.coords.latitude, position.coords.longitude, manualCity)
    }, (error) => {
      setLocationMessage('Please allow location or use manual coordinates')
      console.log(error)
    }, {
      enableHighAccuracy: true
    })
  }

  const handleManualLocationSave = () => {
    const latitude = Number(manualLatitude)
    const longitude = Number(manualLongitude)

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      setLocationMessage('Enter valid latitude and longitude')
      return
    }

    updateLocation(latitude, longitude, manualCity)
  }

  useEffect(()=>{
if(!socket || userData.role!=="deliveryBoy") return
let watchId
if(navigator.geolocation){
watchId=navigator.geolocation.watchPosition((position)=>{
    const latitude=position.coords.latitude
    const longitude=position.coords.longitude
    setDeliveryBoyLocation({lat:latitude,lon:longitude})
    socket.emit('updateLocation',{
      latitude,
      longitude,
      userId:userData._id
    })
  },
  (error)=>{
    console.log(error)
  },
  {
    enableHighAccuracy:true
  }
)
}

return ()=>{
  if(watchId)navigator.geolocation.clearWatch(watchId)
}

  },[socket,userData])


const ratePerDelivery=50
const totalEarning=todayDeliveries.reduce((sum,d)=>sum + d.count*ratePerDelivery,0)

const toRad = (value) => (value * Math.PI) / 180
const getDistanceKm = (fromLat, fromLon, toLat, toLon) => {
  if (![fromLat, fromLon, toLat, toLon].every(v => Number.isFinite(Number(v)))) return null
  const earthRadiusKm = 6371
  const dLat = toRad(Number(toLat) - Number(fromLat))
  const dLon = toRad(Number(toLon) - Number(fromLon))
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(Number(fromLat))) * Math.cos(toRad(Number(toLat))) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return (earthRadiusKm * c).toFixed(2)
}

const riderLat = deliveryBoyLocation?.lat ?? userData?.location?.coordinates?.[1]
const riderLon = deliveryBoyLocation?.lon ?? userData?.location?.coordinates?.[0]



  const getAssignments=async () => {
    try {
      const result=await axios.get(`${serverUrl}/api/order/get-assignments`,{withCredentials:true})
      
      setAvailableAssignments(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  const getCurrentOrder=async () => {
     try {
      const result=await axios.get(`${serverUrl}/api/order/get-current-order`,{withCredentials:true})
    setCurrentOrder(result.data)
    } catch (error) {
      if (error.response && error.response.status === 400) {
        // no current assignment - expected for idle delivery boys
        setCurrentOrder(null)
      } else {
        console.log(error)
      }
    }
  }


  const acceptOrder=async (assignmentId) => {
    try {
      const result=await axios.get(`${serverUrl}/api/order/accept-order/${assignmentId}`,{withCredentials:true})
    console.log(result.data)
    await getCurrentOrder()
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(()=>{
    if (!socket || !userData || userData.role !== "deliveryBoy") return
    socket.on('newAssignment',(data)=>{
      setAvailableAssignments(prev => ([...(prev || []), data]))
    })
    return ()=>{
      socket.off('newAssignment')
    }
  },[socket, userData])
  
  const sendOtp=async () => {
    setLoading(true)
    try {
      const result=await axios.post(`${serverUrl}/api/order/send-delivery-otp`,{
        orderId:currentOrder._id,shopOrderId:currentOrder.shopOrder._id
      },{withCredentials:true})
      setLoading(false)
       setShowOtpBox(true)
    console.log(result.data)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }
   const verifyOtp=async () => {
    setMessage("")
    try {
      const result=await axios.post(`${serverUrl}/api/order/verify-delivery-otp`,{
        orderId:currentOrder._id,shopOrderId:currentOrder.shopOrder._id,otp
      },{withCredentials:true})
    console.log(result.data)
    setMessage(result.data.message)
    location.reload()
    } catch (error) {
      console.log(error)
    }
  }


   const handleTodayDeliveries=async () => {
    
    try {
      const result=await axios.get(`${serverUrl}/api/order/get-today-deliveries`,{withCredentials:true})
    console.log(result.data)
   setTodayDeliveries(result.data)
    } catch (error) {
      console.log(error)
    }
  }
 

  useEffect(()=>{
    if (!userData || userData.role !== "deliveryBoy") {
      setAvailableAssignments(null)
      setCurrentOrder(null)
      setTodayDeliveries([])
      return
    }
    getAssignments()
    getCurrentOrder()
    handleTodayDeliveries()
  },[userData])
  return (
    <div className='w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto'>
      <Nav/>
      <div className='w-full max-w-[800px] flex flex-col gap-5 items-center'>
    <div className='bg-white rounded-2xl shadow-md p-5 flex flex-col justify-start items-center w-[90%] border border-orange-100 text-center gap-2'>
<h1 className='text-xl font-bold text-[#ff4d2d]'>Welcome, {userData.fullName}</h1>
<p className='text-[#ff4d2d] '><span className='font-semibold'>Latitude:</span> {deliveryBoyLocation?.lat}, <span className='font-semibold'>Longitude:</span> {deliveryBoyLocation?.lon}</p>
    </div>

  <div className='bg-white rounded-2xl shadow-md p-5 flex flex-col gap-4 w-[90%] border border-orange-100'>
    <div>
      <h2 className='text-lg font-bold text-[#ff4d2d] mb-1'>Set Rider Location</h2>
      <p className='text-sm text-gray-500'>Order assignment depends on live coordinates. City is optional, but you must set accurate GPS or manual latitude and longitude.</p>
    </div>
    <div className='flex flex-col sm:flex-row gap-3'>
      <button className='flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600' onClick={handleUseBrowserLocation}>Use Current Browser Location</button>
      <button className='flex-1 bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-black' onClick={handleManualLocationSave}>Save Manual Location</button>
    </div>
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
      <input
        type='text'
        value={manualLatitude}
        onChange={(e)=>setManualLatitude(e.target.value)}
        placeholder='Latitude'
        className='border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400'
      />
      <input
        type='text'
        value={manualLongitude}
        onChange={(e)=>setManualLongitude(e.target.value)}
        placeholder='Longitude'
        className='border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400'
      />
      <input
        type='text'
        value={manualCity}
        onChange={(e)=>setManualCity(e.target.value)}
        placeholder='City name'
        className='border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400'
      />
    </div>
    <div className='flex items-center justify-between text-sm text-gray-600'>
      <span>Saved city: <span className='font-medium text-[#ff4d2d]'>{currentCity || 'Not set'}</span></span>
      {locationMessage && <span className='font-medium text-green-600'>{locationMessage}</span>}
    </div>
  </div>

<div className='bg-white rounded-2xl shadow-md p-5 w-[90%] mb-6 border border-orange-100'>
  <h1 className='text-lg font-bold mb-3 text-[#ff4d2d] '>Today Deliveries</h1>

  <ResponsiveContainer width="100%" height={200}>
   <BarChart data={todayDeliveries}>
  <CartesianGrid strokeDasharray="3 3"/>
  <XAxis dataKey="hour" tickFormatter={(h)=>`${h}:00`}/>
    <YAxis  allowDecimals={false}/>
    <Tooltip formatter={(value)=>[value,"orders"]} labelFormatter={label=>`${label}:00`}/>
      <Bar dataKey="count" fill='#ff4d2d'/>
   </BarChart>
  </ResponsiveContainer>

  <div className='max-w-sm mx-auto mt-6 p-6 bg-white rounded-2xl shadow-lg text-center'>
<h1 className='text-xl font-semibold text-gray-800 mb-2'>Today's Earning</h1>
<span className='text-3xl font-bold text-green-600'>₹{totalEarning}</span>
  </div>
</div>


{!currentOrder && <div className='bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100'>
<h1 className='text-lg font-bold mb-4 flex items-center gap-2'>Available Orders</h1>

<div className='space-y-4'>
{availableAssignments?.length>0
?
(
availableAssignments.map((a,index)=>(
  <div className='border rounded-lg p-4 flex justify-between items-center' key={index}>
   <div>
    <p className='text-sm font-semibold'>{a?.shopName}</p>
  <p className='text-sm text-gray-500'><span className='font-semibold'>Pickup:</span> {a?.shopAddress || 'Shop address not available'}</p>
    <p className='text-sm text-gray-500'><span className='font-semibold'>Delivery Address:</span> {a?.deliveryAddress.text}</p>
<p className='text-xs text-gray-500'>Distance to pickup: {getDistanceKm(riderLat, riderLon, a?.shopLocation?.lat, a?.shopLocation?.lon) || 'N/A'} km</p>
<p className='text-xs text-gray-500'>Distance to customer: {getDistanceKm(riderLat, riderLon, a?.deliveryAddress?.latitude, a?.deliveryAddress?.longitude) || 'N/A'} km</p>
<p className='text-xs text-gray-400'>{a.items.length} items | {a.subtotal}</p>
   </div>
   <button className='bg-orange-500 text-white px-4 py-1 rounded-lg text-sm hover:bg-orange-600' onClick={()=>acceptOrder(a.assignmentId)}>Accept</button>

  </div>
))
):<p className='text-gray-400 text-sm'>No Available Orders</p>}
</div>
</div>}

{currentOrder && <div className='bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100'>
<h2 className='text-lg font-bold mb-3'>📦Current Order</h2>
<div className='border rounded-lg p-4 mb-3'>
  <p className='font-semibold text-sm'>{currentOrder?.shopOrder.shop.name}</p>
  <p className='text-sm text-gray-500'>{currentOrder.deliveryAddress.text}</p>
 <p className='text-xs text-gray-400'>{currentOrder.shopOrder.shopOrderItems.length} items | {currentOrder.shopOrder.subtotal}</p>
</div>

 <DeliveryBoyTracking data={{ 
  deliveryBoyLocation:deliveryBoyLocation || {
        lat: userData.location.coordinates[1],
        lon: userData.location.coordinates[0]
      },
      customerLocation: {
        lat: currentOrder.deliveryAddress.latitude,
        lon: currentOrder.deliveryAddress.longitude
      },
      shopLocation: currentOrder.shopLocation,
      shopAddress: currentOrder.shopAddress
    }} />
{!showOtpBox ? <button className='mt-4 w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-600 active:scale-95 transition-all duration-200' onClick={sendOtp} disabled={loading}>
{loading?<ClipLoader size={20} color='white'/> :"Mark As Delivered"}
 </button>:<div className='mt-4 p-4 border rounded-xl bg-gray-50'>
<p className='text-sm font-semibold mb-2'>Enter Otp send to <span className='text-orange-500'>{currentOrder.user.fullName}</span></p>
<input type="text" className='w-full border px-3 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400' placeholder='Enter OTP' onChange={(e)=>setOtp(e.target.value)} value={otp}/>
{message && <p className='text-center text-green-400 text-2xl mb-4'>{message}</p>}

<button className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-all" onClick={verifyOtp}>Submit OTP</button>
  </div>}

  </div>}


      </div>
    </div>
  )
}

export default DeliveryBoy
