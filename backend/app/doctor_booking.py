# Doctor Booking System with Beautiful Features

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, List, Optional
from datetime import datetime, timedelta
import random

app = FastAPI(title="AuraHealth - Doctor Booking System")

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Models
class Doctor(BaseModel):
    id: str
    name: str
    specialization: str
    experience: int
    rating: float
    availability: List[str]  # ["Monday 9AM-5PM", "Tuesday 9AM-5PM"]
    consultation_fee: int
    image_url: str
    about: str
    education: str
    languages: List[str]
    achievements: List[str]
    specialties: List[str]
    consultation_types: List[str]
    hospital_affiliations: List[str]
    awards: List[str]
    publications: List[str]
    board_certifications: List[str]
    research_interests: List[str]
    professional_memberships: List[str]

class Appointment(BaseModel):
    id: str
    doctor_id: str
    patient_name: str
    patient_email: str
    patient_phone: str
    date: str
    time: str
    reason: str
    status: str  # "scheduled", "completed", "cancelled"
    created_at: str

class AppointmentRequest(BaseModel):
    doctor_id: str
    patient_name: str
    patient_email: str
    patient_phone: str
    date: str
    time: str
    reason: str

# Sample Data - Enhanced Doctor Profiles with Comprehensive Details
DOCTORS_DATABASE = [
    Doctor(
        id="doc001",
        name="Dr. Priya Sharma",
        specialization="General Physician",
        experience=12,
        rating=4.8,
        availability=["Monday 9AM-5PM", "Tuesday 9AM-5PM", "Wednesday 9AM-1PM", "Friday 9AM-5PM"],
        consultation_fee=500,
        image_url="https://example.com/dr-priya.jpg",
        about="Compassionate general physician with expertise in preventive healthcare and chronic disease management. Dedicated to providing personalized care to patients of all ages. Known for her thorough diagnostic approach and patient education.",
        education="MBBS, MD (Internal Medicine) - AIIMS Delhi (2008-2012), Fellowship in Preventive Cardiology - Johns Hopkins (2013)",
        languages=["English", "Hindi", "Punjabi"],
        achievements=["Best Physician Award 2020", "Published 15+ research papers", "Speaker at National Medical Conferences"],
        specialties=["Diabetes Management", "Hypertension", "Preventive Healthcare", "Geriatric Care", "Vaccination"],
        consultation_types=["In-Person", "Video Consultation", "Follow-up Visit"],
        hospital_affiliations=["City General Hospital", "Apollo Clinic", "Max Healthcare"],
        awards=["Excellence in Patient Care 2019", "Top Rated Physician 2021"],
        publications=["Journal of Internal Medicine", "Diabetes Care Journal"],
        board_certifications=["American Board of Internal Medicine", "Medical Council of India"],
        research_interests=["Preventive Cardiology", "Diabetes Management", "Public Health"],
        professional_memberships=["Indian Medical Association", "American College of Physicians"]
    ),
    Doctor(
        id="doc002", 
        name="Dr. Rahul Verma",
        specialization="Cardiologist",
        experience=15,
        rating=4.9,
        availability=["Monday 2PM-6PM", "Wednesday 2PM-6PM", "Thursday 9AM-1PM", "Saturday 10AM-2PM"],
        consultation_fee=1200,
        image_url="https://example.com/dr-rahul.jpg",
        about="Expert cardiologist specializing in interventional cardiology and heart failure management. Committed to delivering world-class cardiac care with advanced treatment options. Has performed over 5000 cardiac procedures with exceptional success rates.",
        education="MBBS, MD (Cardiology) - PGIMER Chandigarh (2005-2009), Fellowship in Interventional Cardiology - Cleveland Clinic (2010-2012)",
        languages=["English", "Hindi", "Gujarati"],
        achievements=["5000+ Cardiac Procedures", "Pioneer in TAVI procedures", "Research Grant Recipient"],
        specialties=["Interventional Cardiology", "Heart Failure", "Coronary Angioplasty", "Pacemaker Implantation", "TAVI"],
        consultation_types=["Cardiac Consultation", "Second Opinion", "Pre-operative Assessment", "Post-operative Follow-up"],
        hospital_affiliations=["Metro Heart Institute", "Fortis Hospital", "Narayana Health"],
        awards=["Best Cardiologist 2021", "Innovation in Cardiac Care 2020"],
        publications=["European Heart Journal", "Circulation Research", "Journal of American College of Cardiology"],
        board_certifications=["American Board of Internal Medicine (Cardiology)", "National Board of Examinations"],
        research_interests=["Interventional Cardiology", "Heart Failure Management", "Structural Heart Disease"],
        professional_memberships=["American College of Cardiology", "Cardiological Society of India", "European Society of Cardiology"]
    ),
    Doctor(
        id="doc003",
        name="Dr. Anjali Patel",
        specialization="Gynecologist",
        experience=10,
        rating=4.7,
        availability=["Monday 10AM-4PM", "Tuesday 10AM-4PM", "Thursday 10AM-4PM", "Friday 10AM-2PM"],
        consultation_fee=800,
        image_url="https://example.com/dr-anjali.jpg",
        about="Dedicated gynecologist providing comprehensive women's healthcare services. Specializes in high-risk pregnancies and minimally invasive gynecological surgeries. Passionate about women's health education and empowerment.",
        education="MBBS, MS (Obstetrics & Gynecology) - KEM Mumbai (2010-2014), Fellowship in Reproductive Medicine - Singapore (2015)",
        languages=["English", "Hindi", "Marathi", "Gujarati"],
        achievements=["1000+ Successful Deliveries", "Laparoscopic Surgery Expert", "Women's Health Advocate"],
        specialties=["High-Risk Pregnancy", "Laparoscopic Surgeries", "Infertility Treatment", "Menopause Management", "PCOD Treatment"],
        consultation_types=["Prenatal Care", "Gynecological Consultation", "Infertility Evaluation", "Menopause Clinic"],
        hospital_affiliations=["Women's Health Center", "Lilavati Hospital", "Jaslok Hospital"],
        awards=["Excellence in Women's Healthcare 2021", "Best Gynecologist 2020"],
        publications=["International Journal of Gynecology", "Fertility and Sterility"],
        board_certifications=["Royal College of Obstetricians and Gynaecologists", "Medical Council of India"],
        research_interests=["Reproductive Medicine", "High-Risk Pregnancy", "Minimally Invasive Surgery"],
        professional_memberships=["Federation of Obstetric and Gynecological Societies", "American Society for Reproductive Medicine"]
    ),
    Doctor(
        id="doc004",
        name="Dr. Vikram Singh",
        specialization="Orthopedic Surgeon",
        experience=18,
        rating=4.9,
        availability=["Monday 9AM-3PM", "Wednesday 9AM-3PM", "Friday 9AM-3PM", "Saturday 9AM-1PM"],
        consultation_fee=1000,
        image_url="https://example.com/dr-vikram.jpg",
        about="Renowned orthopedic surgeon with expertise in joint replacement and sports medicine. Pioneered minimally invasive surgical techniques in the region. Has successfully treated numerous professional athletes and sports personalities.",
        education="MBBS, MS (Orthopedics) - AIIMS Delhi (2002-2006), Fellowship (Joint Replacement) - Hospital for Special Surgery, New York (2007-2009)",
        languages=["English", "Hindi", "Punjabi"],
        achievements=["3000+ Joint Replacements", "Sports Medicine Pioneer", "Robotic Surgery Expert"],
        specialties=["Joint Replacement Surgery", "Arthroscopy", "Sports Injuries", "Spine Surgery", "Robotic Orthopedics"],
        consultation_types=["Orthopedic Consultation", "Joint Replacement Counseling", "Sports Injury Assessment", "Second Opinion"],
        hospital_affiliations=["Orthopedic Excellence Center", "Medanta Hospital", "Artemis Hospital"],
        awards=["Best Orthopedic Surgeon 2021", "Sports Medicine Excellence 2020"],
        publications=["Journal of Bone and Joint Surgery", "American Journal of Sports Medicine"],
        board_certifications=["American Board of Orthopaedic Surgery", "National Board of Examinations"],
        research_interests=["Joint Replacement Technology", "Sports Medicine", "Robotic Surgery", "Regenerative Medicine"],
        professional_memberships=["American Academy of Orthopaedic Surgeons", "Indian Orthopaedic Association", "International Society of Arthroscopy"]
    ),
    Doctor(
        id="doc005",
        name="Dr. Meera Krishnan",
        specialization="Pediatrician",
        experience=8,
        rating=4.8,
        availability=["Monday 11AM-5PM", "Tuesday 11AM-5PM", "Wednesday 11AM-5PM", "Thursday 11AM-5PM"],
        consultation_fee=600,
        image_url="https://example.com/dr-meera.jpg",
        about="Child-friendly pediatrician specializing in newborn care, vaccinations, and pediatric emergencies. Believes in creating a comfortable environment for children. Known for her gentle approach and excellent rapport with kids.",
        education="MBBS, MD (Pediatrics) - CMC Vellore (2012-2016), Fellowship in Neonatology - Boston Children's Hospital (2017-2018)",
        languages=["English", "Hindi", "Tamil", "Malayalam"],
        achievements=["5000+ Vaccinations", "Neonatal Care Expert", "Child Health Advocate"],
        specialties=["Newborn Care", "Pediatric Vaccination", "Child Development", "Pediatric Nutrition", "Adolescent Medicine"],
        consultation_types=["Well Baby Checkup", "Vaccination Clinic", "Sick Child Visit", "Developmental Assessment"],
        hospital_affiliations=["Children's Medical Center", "Rainbow Hospital", "Apollo Cradle"],
        awards=["Best Pediatrician 2021", "Child Care Excellence 2020"],
        publications=["Journal of Pediatrics", "Indian Pediatrics"],
        board_certifications=["American Board of Pediatrics", "National Board of Examinations"],
        research_interests=["Neonatology", "Vaccination Protocols", "Child Development", "Pediatric Nutrition"],
        professional_memberships=["Indian Academy of Pediatrics", "American Academy of Pediatrics"]
    ),
    Doctor(
        id="doc006",
        name="Dr. Amit Kumar",
        specialization="Dermatologist",
        experience=11,
        rating=4.6,
        availability=["Tuesday 10AM-4PM", "Wednesday 10AM-4PM", "Friday 10AM-4PM", "Saturday 10AM-2PM"],
        consultation_fee=700,
        image_url="https://example.com/dr-amit.jpg",
        about="Expert dermatologist specializing in cosmetic dermatology and treating complex skin conditions. Uses latest laser and cosmetic treatments for optimal results. Committed to helping patients achieve healthy, beautiful skin.",
        education="MBBS, MD (Dermatology) - Manipal Hospital (2009-2013), Fellowship in Cosmetic Dermatology - Harley Street, London (2014-2015)",
        languages=["English", "Hindi", "Kannada"],
        achievements=["10000+ Cosmetic Procedures", "Laser Treatment Expert", "Skin Cancer Detection"],
        specialties=["Cosmetic Dermatology", "Laser Treatments", "Acne Treatment", "Anti-Aging Procedures", "Skin Cancer Screening"],
        consultation_types=["Dermatology Consultation", "Cosmetic Procedure", "Laser Treatment", "Skin Cancer Screening"],
        hospital_affiliations=["Skin & Laser Clinic", "Manipal Hospital", "Columbia Asia Hospital"],
        awards=["Best Dermatologist 2021", "Cosmetic Excellence 2020"],
        publications=["Journal of Dermatological Science", "International Journal of Dermatology"],
        board_certifications=["American Board of Dermatology", "National Board of Examinations"],
        research_interests=["Cosmetic Dermatology", "Laser Technology", "Skin Aging", "Dermatological Surgery"],
        professional_memberships=["Indian Association of Dermatologists", "American Academy of Dermatology", "International Society of Dermatology"]
    )
]

# Appointment storage
APPOINTMENTS_DATABASE = []

class DoctorBookingSystem:
    def __init__(self):
        self.doctors = DOCTORS_DATABASE
        self.appointments = APPOINTMENTS_DATABASE
    
    def get_all_doctors(self) -> List[Doctor]:
        return self.doctors
    
    def get_doctor_by_id(self, doctor_id: str) -> Optional[Doctor]:
        for doctor in self.doctors:
            if doctor.id == doctor_id:
                return doctor
        return None
    
    def get_doctors_by_specialization(self, specialization: str) -> List[Doctor]:
        return [doc for doc in self.doctors if specialization.lower() in doc.specialization.lower()]
    
    def check_availability(self, doctor_id: str, date: str, time: str) -> bool:
        # Check if doctor exists
        doctor = self.get_doctor_by_id(doctor_id)
        if not doctor:
            return False
        
        # Check if time slot is already booked
        for appointment in self.appointments:
            if (appointment.doctor_id == doctor_id and 
                appointment.date == date and 
                appointment.time == time and 
                appointment.status != "cancelled"):
                return False
        
        return True
    
    def book_appointment(self, request: AppointmentRequest) -> Appointment:
        # Check availability
        if not self.check_availability(request.doctor_id, request.date, request.time):
            raise HTTPException(status_code=400, detail="Time slot not available")
        
        # Create appointment
        appointment = Appointment(
            id=f"apt_{len(self.appointments) + 1:03d}",
            doctor_id=request.doctor_id,
            patient_name=request.patient_name,
            patient_email=request.patient_email,
            patient_phone=request.patient_phone,
            date=request.date,
            time=request.time,
            reason=request.reason,
            status="scheduled",
            created_at=datetime.now().isoformat()
        )
        
        self.appointments.append(appointment)
        return appointment
    
    def get_appointments_by_patient(self, patient_email: str) -> List[Appointment]:
        return [apt for apt in self.appointments if apt.patient_email == patient_email]
    
    def cancel_appointment(self, appointment_id: str) -> bool:
        for appointment in self.appointments:
            if appointment.id == appointment_id:
                appointment.status = "cancelled"
                return True
        return False

# Initialize booking system
booking_system = DoctorBookingSystem()

# Endpoints
@app.get("/healthz")
async def health_check():
    return {"status": "ok", "system": "doctor_booking", "doctors_count": len(booking_system.doctors)}

@app.get("/api/doctors", response_model=List[Doctor])
async def get_all_doctors():
    """Get all available doctors"""
    return booking_system.get_all_doctors()

@app.get("/api/doctors/{doctor_id}", response_model=Doctor)
async def get_doctor_by_id(doctor_id: str):
    """Get doctor details by ID"""
    doctor = booking_system.get_doctor_by_id(doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor

@app.get("/api/doctors/specialization/{specialization}", response_model=List[Doctor])
async def get_doctors_by_specialization(specialization: str):
    """Get doctors by specialization"""
    doctors = booking_system.get_doctors_by_specialization(specialization)
    return doctors

@app.post("/api/appointments/book", response_model=Appointment)
async def book_appointment(request: AppointmentRequest):
    """Book an appointment with a doctor"""
    try:
        appointment = booking_system.book_appointment(request)
        return appointment
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to book appointment")

@app.get("/api/appointments/patient/{patient_email}", response_model=List[Appointment])
async def get_patient_appointments(patient_email: str):
    """Get all appointments for a patient"""
    return booking_system.get_appointments_by_patient(patient_email)

@app.put("/api/appointments/{appointment_id}/cancel")
async def cancel_appointment(appointment_id: str):
    """Cancel an appointment"""
    success = booking_system.cancel_appointment(appointment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": "Appointment cancelled successfully"}

@app.get("/api/availability/{doctor_id}/{date}")
async def check_doctor_availability(doctor_id: str, date: str):
    """Check available time slots for a doctor on a specific date"""
    doctor = booking_system.get_doctor_by_id(doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    # Generate time slots (9 AM to 5 PM, 30-minute intervals)
    all_slots = []
    for hour in range(9, 17):
        for minute in [0, 30]:
            time_str = f"{hour:02d}:{minute:02d}"
            all_slots.append(time_str)
    
    # Filter available slots
    available_slots = []
    for slot in all_slots:
        if booking_system.check_availability(doctor_id, date, slot):
            available_slots.append(slot)
    
    return {
        "doctor_id": doctor_id,
        "date": date,
        "available_slots": available_slots,
        "doctor_name": doctor.name
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
