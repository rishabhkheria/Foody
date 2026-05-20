import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import {  setCurrentAddress, setCurrentCity, setCurrentState, setUserData } from '../redux/userSlice'
import { setAddress, setLocation } from '../redux/mapSlice'

function useGetCity() {
    const dispatch=useDispatch()
    const {userData}=useSelector(state=>state.user)
    const apiKey=import.meta.env.VITE_GEOAPIKEY
    useEffect(()=>{
const preferredCity=localStorage.getItem('preferredCity')
if (preferredCity) {
    dispatch(setCurrentCity(preferredCity))
    return
}

if (!navigator.geolocation) return

navigator.geolocation.getCurrentPosition(async (position)=>{
    const latitude=position.coords.latitude
    const longitude=position.coords.longitude
    dispatch(setLocation({lat:latitude,lon:longitude}))
    const result=await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`)
    const geoData=result?.data?.results?.[0]
    dispatch(setCurrentCity(geoData?.city||geoData?.county))
    dispatch(setCurrentState(geoData?.state))
    dispatch(setCurrentAddress(geoData?.address_line2 || geoData?.address_line1 ))
    dispatch(setAddress(geoData?.address_line2 || geoData?.address_line1))
}, (error)=>{
    console.log(error)
})
    },[userData])
}

export default useGetCity
