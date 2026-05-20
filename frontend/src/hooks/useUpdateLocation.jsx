import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import {  setCurrentAddress, setCurrentCity, setCurrentState, setUserData } from '../redux/userSlice'
import { setAddress, setLocation } from '../redux/mapSlice'

function useUpdateLocation() {
    const dispatch=useDispatch()
    const {userData}=useSelector(state=>state.user)
 
    useEffect(()=>{
    if (!userData || userData.role !== 'deliveryBoy') return

    const updateLocation = async (lat, lon) => {
        try {
            await axios.post(`${serverUrl}/api/user/update-location`, { lat, lon }, { withCredentials: true })
        } catch (err) {
            // ignore expected auth/400 errors but log unexpected
            console.log('updateLocation error', err?.response?.status || err.message)
        }
    }

    const success = (pos) => {
        updateLocation(pos.coords.latitude, pos.coords.longitude)
    }

    const error = (err) => {
        console.log('geolocation error', err)
    }

    const watchId = navigator.geolocation.watchPosition(success, error, { enableHighAccuracy: true })
    return () => {
        if (watchId && navigator.geolocation.clearWatch) navigator.geolocation.clearWatch(watchId)
    }
    },[userData])
}

export default useUpdateLocation
