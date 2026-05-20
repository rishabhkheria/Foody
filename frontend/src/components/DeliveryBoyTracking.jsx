import React from 'react'
import { GoogleMap, LoadScript, MarkerF, PolylineF } from '@react-google-maps/api'

const mapContainerStyle = {
    width: '100%',
    height: '100%'
}

const mapOptions = {
    disableDefaultUI: false,
    clickableIcons: true,
    gestureHandling: 'greedy'
}

const riderIcon = {
    url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
}

const customerIcon = {
    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
}

const shopIcon = {
    url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
}

function DeliveryBoyTracking({ data }) {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    const deliveryBoyLat = Number(data?.deliveryBoyLocation?.lat)
    const deliveryBoyLon = Number(data?.deliveryBoyLocation?.lon)
    const customerLat = Number(data?.customerLocation?.lat)
    const customerLon = Number(data?.customerLocation?.lon)
    const shopLat = Number(data?.shopLocation?.lat)
    const shopLon = Number(data?.shopLocation?.lon)

    if (!apiKey) {
        return (
            <div className='w-full h-[400px] mt-3 rounded-xl overflow-hidden shadow-md flex items-center justify-center bg-white text-sm text-gray-500 p-4 text-center'>
                Set VITE_GOOGLE_MAPS_API_KEY in your frontend env to enable Google Maps.
            </div>
        )
    }

    if (![deliveryBoyLat, deliveryBoyLon, customerLat, customerLon].every(Number.isFinite)) {
        return (
            <div className='w-full h-[400px] mt-3 rounded-xl overflow-hidden shadow-md flex items-center justify-center bg-white text-sm text-gray-500'>
                Map data is not available yet.
            </div>
        )
    }

    const path = [
        { lat: deliveryBoyLat, lng: deliveryBoyLon },
        { lat: customerLat, lng: customerLon }
    ]

    const center = { lat: deliveryBoyLat, lng: deliveryBoyLon }

    const hasShopLocation = Number.isFinite(shopLat) && Number.isFinite(shopLon)

    return (
        <div className='w-full h-[400px] mt-3 rounded-xl overflow-hidden shadow-md'>
            <LoadScript googleMapsApiKey={apiKey}>
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={14}
                    options={mapOptions}
                >
                    <MarkerF position={center} icon={riderIcon} title='Delivery Boy' />
                    <MarkerF position={{ lat: customerLat, lng: customerLon }} icon={customerIcon} title='Customer' />
                    {hasShopLocation && (
                        <MarkerF position={{ lat: shopLat, lng: shopLon }} icon={shopIcon} title='Restaurant' />
                    )}
                    <PolylineF path={path} options={{ strokeColor: '#2563eb', strokeWeight: 4 }} />
                </GoogleMap>
            </LoadScript>
        </div>
    )
}

export default DeliveryBoyTracking
