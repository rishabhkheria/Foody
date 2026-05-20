import React from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaUtensils } from "react-icons/fa";
import { useState } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import { setMyShopData } from '../redux/ownerSlice';
import { ClipLoader } from 'react-spinners';
import { useEffect } from 'react';
import { GoogleMap, LoadScript, MarkerF } from '@react-google-maps/api'

const mapContainerStyle = {
    width: '100%',
    height: '100%'
}

const mapOptions = {
    disableDefaultUI: false,
    clickableIcons: true,
    gestureHandling: 'greedy'
}

function CreateEditShop() {
    const navigate = useNavigate()
    const { myShopData } = useSelector(state => state.owner)
    const { currentCity,currentState,currentAddress } = useSelector(state => state.user)
    const { location } = useSelector(state => state.map)
    const [name,setName]=useState(myShopData?.name || "")
     const [address,setAddress]=useState(myShopData?.address || currentAddress)
     const [city,setCity]=useState(myShopData?.city || currentCity)
       const [state,setState]=useState(myShopData?.state || currentState)
       const [frontendImage,setFrontendImage]=useState(myShopData?.image || null)
       const [backendImage,setBackendImage]=useState(null)
       const [loading,setLoading]=useState(false)
       const [latitude,setLatitude]=useState(myShopData?.location?.coordinates?.[1] || location?.lat || null)
       const [longitude,setLongitude]=useState(myShopData?.location?.coordinates?.[0] || location?.lon || null)
       const dispatch=useDispatch()

    useEffect(()=>{
     setName(myShopData?.name || "")
     setAddress(myShopData?.address || currentAddress || "")
     setCity(myShopData?.city || currentCity || "")
     setState(myShopData?.state || currentState || "")
     setFrontendImage(myShopData?.image || null)
     setLatitude(myShopData?.location?.coordinates?.[1] || location?.lat || null)
     setLongitude(myShopData?.location?.coordinates?.[0] || location?.lon || null)
    },[myShopData,currentCity,currentState,currentAddress,location?.lat,location?.lon])

       const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) return
        navigator.geolocation.getCurrentPosition((position)=>{
            setLatitude(position.coords.latitude)
            setLongitude(position.coords.longitude)
        },(error)=>{
            console.log(error)
        },{
            enableHighAccuracy:true
        })
       }

       const onMarkerDragEnd = (e) => {
        const lat = e?.latLng?.lat?.() ?? e?.target?.getLatLng?.()?.lat
        const lng = e?.latLng?.lng?.() ?? e?.target?.getLatLng?.()?.lng
        if (typeof lat !== 'number' || typeof lng !== 'number') return
        setLatitude(lat)
        setLongitude(lng)
       }

       const handleImage=(e)=>{
        const file=e.target.files[0]
        setBackendImage(file)
        setFrontendImage(URL.createObjectURL(file))
       }

       const handleSubmit=async (e)=>{
        e.preventDefault()
        setLoading(true)
        try {
           const formData=new FormData()
           formData.append("name",name) 
           formData.append("city",city) 
           formData.append("state",state) 
           formData.append("address",address) 
           if(latitude!==null && longitude!==null){
            formData.append("latitude",latitude)
            formData.append("longitude",longitude)
           }
           if(backendImage){
            formData.append("image",backendImage)
           }
           const result=await axios.post(`${serverUrl}/api/shop/create-edit`,formData,{withCredentials:true})
           dispatch(setMyShopData(result.data))
          setLoading(false)
          navigate("/")
        } catch (error) {
            console.log(error)
            setLoading(false)
        }
       }
    return (
        <div className='flex justify-center flex-col items-center p-6 bg-gradient-to-br from-orange-50 relative to-white min-h-screen'>
            <div className='absolute top-[20px] left-[20px] z-[10] mb-[10px]' onClick={() => navigate("/")}>
                <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
            </div>

            <div className='max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100'>
                <div className='flex flex-col items-center mb-6'>
                    <div className='bg-orange-100 p-4 rounded-full mb-4'>
                        <FaUtensils className='text-[#ff4d2d] w-16 h-16' />
                    </div>
                    <div className="text-3xl font-extrabold text-gray-900">
                        {myShopData ? "Edit Shop" : "Add Shop"}
                    </div>
                </div>
                <form className='space-y-5' onSubmit={handleSubmit}>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Name</label>
                        <input type="text" placeholder='Enter Shop Name' className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                        onChange={(e)=>setName(e.target.value)}
                        value={name}
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>shop Image</label>
                        <input type="file" accept='image/*' className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500' onChange={handleImage}  />
                        {frontendImage &&   <div className='mt-4'>
                            <img src={frontendImage} alt="" className='w-full h-48 object-cover rounded-lg border'/>
                        </div>}
                      
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                           <label className='block text-sm font-medium text-gray-700 mb-1'>City</label>
                        <input type="text" placeholder='City' className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500' onChange={(e)=>setCity(e.target.value)}
                        value={city}/> 
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>State</label>
                        <input type="text" placeholder='State' className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500' onChange={(e)=>setState(e.target.value)}
                        value={state}/> 
                        </div>
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Address</label>
                        <input type="text" placeholder='Enter Shop Address' className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500' onChange={(e)=>setAddress(e.target.value)}
                        value={address}/> 
                    </div>
                    <div>
                        <div className='flex items-center justify-between mb-2'>
                            <label className='block text-sm font-medium text-gray-700'>Shop Location</label>
                            <button type='button' className='text-sm text-[#ff4d2d] font-semibold' onClick={handleUseCurrentLocation}>Use Current Location</button>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mb-3'>
                            <input
                                type="number"
                                step="any"
                                placeholder='Latitude'
                                className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                                onChange={(e)=>setLatitude(e.target.value === "" ? null : Number(e.target.value))}
                                value={latitude ?? ""}
                            />
                            <input
                                type="number"
                                step="any"
                                placeholder='Longitude'
                                className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                                onChange={(e)=>setLongitude(e.target.value === "" ? null : Number(e.target.value))}
                                value={longitude ?? ""}
                            />
                        </div>

                        <div className='h-56 w-full rounded-lg overflow-hidden border'>
                            {latitude !== null && longitude !== null ? (
                                import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
                                    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                                        <GoogleMap
                                            mapContainerStyle={mapContainerStyle}
                                            center={{ lat: latitude, lng: longitude }}
                                            zoom={15}
                                            options={mapOptions}
                                            onClick={(e) => {
                                                const nextLat = e.latLng?.lat()
                                                const nextLng = e.latLng?.lng()
                                                if (typeof nextLat === 'number' && typeof nextLng === 'number') {
                                                    setLatitude(nextLat)
                                                    setLongitude(nextLng)
                                                }
                                            }}
                                        >
                                            <MarkerF
                                                position={{ lat: latitude, lng: longitude }}
                                                draggable
                                                onDragEnd={onMarkerDragEnd}
                                            />
                                        </GoogleMap>
                                    </LoadScript>
                                ) : (
                                    <div className='w-full h-full flex items-center justify-center text-sm text-gray-500 p-4 text-center'>Set VITE_GOOGLE_MAPS_API_KEY in your frontend env to enable Google Map preview.</div>
                                )
                            ) : (
                                <div className='w-full h-full flex items-center justify-center text-sm text-gray-500'>Set latitude/longitude or use current location to pin shop on map.</div>
                            )}
                        </div>
                    </div>
                    <button className='w-full bg-[#ff4d2d] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-orange-600 hover:shadow-lg transition-all duration-200 cursor-pointer' disabled={loading}>
                        {loading?<ClipLoader size={20} color='white'/>:"Save"}
                    
                    </button>
                </form>
            </div>
                
                

        </div>
    )
}

export default CreateEditShop
