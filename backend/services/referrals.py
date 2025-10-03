from typing import List, Optional
from models.screening import Referral
import math
import json
from pathlib import Path

class ReferralService:
    """
    Service to manage TB center referrals and location-based recommendations
    """
    
    def __init__(self):
        self.referral_centers = self._load_referral_data()
    
    def _load_referral_data(self) -> List[Referral]:
        """
        Load referral center data from JSON file or database
        """
        # Load from static JSON file for now
        referral_data = [
            {
                "id": "1",
                "name": "District TB Center - Central Mumbai",
                "type": "DOTS center",
                "phone": "+91 98765 43210",
                "address": "123 Medical Complex, Central District, Mumbai, Maharashtra 400001",
                "lat": 19.0760,
                "lng": 72.8777
            },
            {
                "id": "2",
                "name": "Government General Hospital TB Wing",
                "type": "Hospital",
                "phone": "+91 98765 43211",
                "address": "456 Hospital Road, Dadar, Mumbai, Maharashtra 400014",
                "lat": 19.0176,
                "lng": 72.8562
            },
            {
                "id": "3",
                "name": "City Diagnostic Lab - TB Testing",
                "type": "Laboratory",
                "phone": "+91 98765 43212",
                "address": "789 Lab Street, Andheri, Mumbai, Maharashtra 400069",
                "lat": 19.1136,
                "lng": 72.8697
            },
            {
                "id": "4",
                "name": "Dr. Sharma's Pulmonary Clinic",
                "type": "Specialist Clinic",
                "phone": "+91 98765 43213",
                "address": "321 Clinic Plaza, Bandra, Mumbai, Maharashtra 400050",
                "lat": 19.0596,
                "lng": 72.8295
            },
            {
                "id": "5",
                "name": "Metro Chest & TB Center",
                "type": "Specialist Center",
                "phone": "+91 98765 43214",
                "address": "654 Metro Building, Powai, Mumbai, Maharashtra 400076",
                "lat": 19.1197,
                "lng": 72.9073
            },
            {
                "id": "6",
                "name": "Community Health Worker - Ravi Kumar",
                "type": "Community Support",
                "phone": "+91 98765 43215",
                "address": "Local Community Center, Dharavi, Mumbai, Maharashtra 400017",
                "lat": 19.0423,
                "lng": 72.8570
            },
            {
                "id": "7",
                "name": "Apollo TB Diagnostic Center",
                "type": "Private Hospital",
                "phone": "+91 98765 43216",
                "address": "Apollo Health City, Jubilee Hills, Hyderabad, Telangana 500033",
                "lat": 17.4239,
                "lng": 78.4738
            },
            {
                "id": "8",
                "name": "AIIMS TB & Chest Department",
                "type": "Government Hospital",
                "phone": "+91 98765 43217",
                "address": "AIIMS Campus, Ansari Nagar, New Delhi 110029",
                "lat": 28.5677,
                "lng": 77.2100
            }
        ]
        
        return [Referral(**center) for center in referral_data]
    
    def get_nearby_centers(self, user_lat: Optional[float] = None, 
                          user_lng: Optional[float] = None, 
                          radius_km: float = 50.0,
                          max_results: int = 5) -> List[Referral]:
        """
        Get nearby TB centers based on user location
        """
        if user_lat is None or user_lng is None:
            # Return default centers if no location provided
            return self.referral_centers[:max_results]
        
        # Calculate distances and sort by proximity
        centers_with_distance = []
        
        for center in self.referral_centers:
            distance = self._calculate_distance(user_lat, user_lng, center.lat, center.lng)
            if distance <= radius_km:
                # Create a copy with distance information
                center_dict = center.dict()
                center_dict['distance'] = f"{distance:.1f} km"
                centers_with_distance.append((distance, Referral(**center_dict)))
        
        # Sort by distance and return top results
        centers_with_distance.sort(key=lambda x: x[0])
        return [center for _, center in centers_with_distance[:max_results]]
    
    def get_priority_centers_by_urgency(self, urgency: str, user_lat: Optional[float] = None, 
                                      user_lng: Optional[float] = None) -> List[Referral]:
        """
        Get prioritized centers based on urgency level
        """
        centers = self.get_nearby_centers(user_lat, user_lng, max_results=10)
        
        if urgency == "Immediate":
            # Prioritize hospitals and DOTS centers for immediate cases
            priority_types = ["Hospital", "DOTS center", "Government Hospital"]
            prioritized = [c for c in centers if c.type in priority_types]
            other_centers = [c for c in centers if c.type not in priority_types]
            return (prioritized + other_centers)[:5]
        
        elif urgency == "TestSoon":
            # Include all types but prioritize diagnostic facilities
            priority_types = ["Laboratory", "DOTS center", "Specialist Center"]
            prioritized = [c for c in centers if c.type in priority_types]
            other_centers = [c for c in centers if c.type not in priority_types]
            return (prioritized + other_centers)[:5]
        
        else:  # Monitor
            # Include community resources and general facilities
            return centers[:5]
    
    def _calculate_distance(self, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """
        Calculate distance between two coordinates using Haversine formula
        Returns distance in kilometers
        """
        # Convert latitude and longitude from degrees to radians
        lat1_rad = math.radians(lat1)
        lng1_rad = math.radians(lng1)
        lat2_rad = math.radians(lat2)
        lng2_rad = math.radians(lng2)
        
        # Haversine formula
        dlat = lat2_rad - lat1_rad
        dlng = lng2_rad - lng1_rad
        
        a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlng/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        # Radius of Earth in kilometers
        earth_radius_km = 6371.0
        
        return earth_radius_km * c
    
    def add_emergency_contacts(self, referrals: List[Referral]) -> List[Referral]:
        """
        Add emergency contact information for immediate cases
        """
        enhanced_referrals = []
        
        for referral in referrals:
            referral_dict = referral.dict()
            
            # Add emergency information for hospitals
            if referral.type in ["Hospital", "Government Hospital"]:
                referral_dict['emergency_available'] = True
                referral_dict['hours'] = "24/7"
            else:
                referral_dict['emergency_available'] = False
                referral_dict['hours'] = "9 AM - 5 PM"
            
            enhanced_referrals.append(Referral(**referral_dict))
        
        return enhanced_referrals
    
    def get_center_by_id(self, center_id: str) -> Optional[Referral]:
        """
        Get specific center by ID
        """
        for center in self.referral_centers:
            if center.id == center_id:
                return center
        return None