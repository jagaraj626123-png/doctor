const doctors = [
  { name: "Demo Doctor A", specialty: "General Medicine", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80", alt: "Doctor portrait, illustrative stock photo", experience: "Not provided", fee: "Not provided", search: "fever general physician headache" },
  { name: "Demo Doctor B", specialty: "Ophthalmology", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80", alt: "Doctor portrait, illustrative stock photo", experience: "Not provided", fee: "Not provided", search: "eye problems eye care vision" },
  { name: "Demo Doctor C", specialty: "ENT", image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&q=80", alt: "Doctor portrait, illustrative stock photo", experience: "Not provided", fee: "Not provided", search: "throat pain ent ear nose throat" },
  { name: "Demo Doctor D", specialty: "Orthopedics", image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80", alt: "Doctor portrait, illustrative stock photo", experience: "Not provided", fee: "Not provided", search: "leg pain bone joint" },
  { name: "Demo Doctor E", specialty: "Neurology", image: "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&w=600&q=80", alt: "Doctor portrait, illustrative stock photo", experience: "Not provided", fee: "Not provided", search: "headache neurology" }
];

const doctorGrid = document.querySelector("#doctorGrid");
const specialtyFilter = document.querySelector("#specialtyFilter");
const doctorSearch = document.querySelector("#doctorSearch");
const noDoctorsMessage = document.querySelector("#noDoctorsMessage");
const appointmentForm = document.querySelector("#appointmentForm");
const departmentSelect = document.querySelector("#departmentSelect");
const doctorSelect = document.querySelector("#doctorSelect");

function renderDoctors() {
  const specialty = specialtyFilter.value;
  const query = doctorSearch.value.trim().toLowerCase();
  const matches = doctors.filter((doctor) => {
    const matchesSpecialty = !specialty || doctor.specialty === specialty;
    const matchesQuery = !query || `${doctor.name} ${doctor.specialty} ${doctor.search}`.toLowerCase().includes(query);
    return matchesSpecialty && matchesQuery;
  });

  doctorGrid.replaceChildren(...matches.map((doctor) => {
    const card = document.createElement("article");
    card.className = "doctor-card";

    const photoWrap = document.createElement("div");
    photoWrap.className = "doctor-photo-wrap";
    const image = document.createElement("img");
    image.className = "doctor-photo";
    image.src = doctor.image;
    image.alt = doctor.alt;
    image.loading = "lazy";
    const badge = document.createElement("span");
    badge.className = "demo-pill";
    badge.textContent = "DEMO PROFILE";
    photoWrap.append(image, badge);

    const info = document.createElement("div");
    info.className = "doctor-info";
    const name = document.createElement("h3");
    name.textContent = doctor.name;
    const specialtyText = document.createElement("div");
    specialtyText.className = "doctor-specialty";
    specialtyText.textContent = doctor.specialty;
    const meta = document.createElement("div");
    meta.className = "doctor-meta";
    meta.append(createTextElement("span", `Experience: ${doctor.experience}`), createTextElement("span", "Demo information"));
    const fee = createTextElement("p", `Consultation fee: ${doctor.fee}`);
    fee.className = "doctor-fee";
    const bookButton = createTextElement("a", "Request an appointment →");
    bookButton.className = "button button-outline doctor-book";
    bookButton.href = "#appointment";
    info.append(name, specialtyText, meta, fee, bookButton);
    card.append(photoWrap, info);
    return card;
  }));
  noDoctorsMessage.hidden = matches.length > 0;
}

function createTextElement(tagName, text) {
  const element = document.createElement(tagName);
  element.textContent = text;
  return element;
}

function updateDoctorChoices() {
  const department = departmentSelect.value;
  const available = doctors.filter((doctor) => doctor.specialty === department);
  doctorSelect.replaceChildren(new Option(available.length ? "Choose a demo profile" : "No demo profiles for this department", ""));
  doctorSelect.disabled = available.length === 0;
  available.forEach((doctor) => doctorSelect.add(new Option(doctor.name, doctor.name)));
  clearError("doctor");
}

function clearError(fieldName) {
  const input = document.querySelector(`#${fieldName}`);
  const error = document.querySelector(`#${fieldName}Error`);
  if (input) {
    input.classList.remove("input-invalid");
    input.removeAttribute("aria-invalid");
  }
  if (error) error.textContent = "";
}

function setError(fieldName, message) {
  const input = document.querySelector(`#${fieldName}`);
  const error = document.querySelector(`#${fieldName}Error`);
  if (input) {
    input.classList.add("input-invalid");
    input.setAttribute("aria-invalid", "true");
  }
  if (error) error.textContent = message;
}

function setDateMinimum(input) {
  const today = new Date();
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  input.min = localDate;
}

function validateMobile(value) {
  const mobile = value.trim();
  const digitCount = mobile.replace(/\D/g, "").length;
  return /^[+]?[0-9\s()-]{8,15}$/.test(mobile) && digitCount >= 10 && digitCount <= 15;
}

function setupValidation(form, fields, validate) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    fields.forEach((field) => clearError(field));
    const values = Object.fromEntries(new FormData(form).entries());
    let isValid = true;

    fields.forEach((field) => {
      const input = form.elements.namedItem(field);
      if (!input.value.trim()) {
        setError(field, "Please complete this field.");
        isValid = false;
      }
    });
    if (isValid) isValid = validate(values);
    if (!isValid) {
      form.querySelector(".input-invalid")?.focus();
      return;
    }
    showSummary(form, values);
  });

  fields.forEach((field) => {
    const input = form.elements.namedItem(field);
    input.addEventListener("input", () => clearError(field));
    input.addEventListener("change", () => clearError(field));
  });
}

function showSummary(form, values) {
  const feedback = form.querySelector(".form-feedback");
  const heading = createTextElement("h4", form.id === "appointmentForm" ? "Appointment request preview" : "Lab request preview");
  const lines = form.id === "appointmentForm"
    ? [
      ["Patient", values.patientName], ["Mobile", values.mobile], ["Age", values.age],
      ["Gender", values.gender], ["Department", values.department], ["Doctor", values.doctor],
      ["Preferred date", values.appointmentDate], ["Time", values.timeSlot],
      ...(values.reason.trim() ? [["Reason", values.reason.trim()]] : [])
    ]
    : [["Patient", values.labPatientName], ["Mobile", values.labMobile], ["Test", values.labTest], ["Preferred date", values.labDate]];
  const content = lines.map(([label, value]) => {
    const line = document.createElement("p");
    line.append(createTextElement("strong", `${label}: `), document.createTextNode(value));
    return line;
  });
  const note = createTextElement("p", "Demo only: this request has not been sent, booked, or stored. Contact the hospital directly to confirm real services and availability.");
  note.className = "summary-note";
  feedback.replaceChildren(heading, ...content, note);
  feedback.hidden = false;
  feedback.focus();
}

document.querySelector("#doctorSearchForm").addEventListener("submit", (event) => {
  event.preventDefault();
  renderDoctors();
  document.querySelector("#doctors").scrollIntoView({ behavior: "smooth" });
});

doctorSearch.addEventListener("input", renderDoctors);
specialtyFilter.addEventListener("change", renderDoctors);
departmentSelect.addEventListener("change", updateDoctorChoices);

document.querySelectorAll(".department-card[data-department]").forEach((card) => {
  card.addEventListener("click", () => {
    departmentSelect.value = card.dataset.department;
    updateDoctorChoices();
    document.querySelector("#appointment").scrollIntoView({ behavior: "smooth" });
  });
});

setupValidation(appointmentForm, ["patientName", "mobile", "age", "gender", "departmentSelect", "doctorSelect", "appointmentDate", "timeSlot"], (values) => {
  let valid = true;
  if (!validateMobile(values.mobile)) {
    setError("mobile", "Enter a valid phone number.");
    valid = false;
  }
  const age = Number(values.age);
  if (!Number.isInteger(age) || age < 0 || age > 120) {
    setError("age", "Enter an age between 0 and 120.");
    valid = false;
  }
  if (values.appointmentDate < document.querySelector("#appointmentDate").min) {
    setError("appointmentDate", "Choose today or a future date.");
    valid = false;
  }
  return valid;
});

const labSection = document.querySelector("#lab-request");
document.querySelector("#openLabForm").addEventListener("click", () => {
  labSection.hidden = false;
  labSection.scrollIntoView({ behavior: "smooth" });
  document.querySelector("#labPatientName").focus({ preventScroll: true });
});

setupValidation(document.querySelector("#labForm"), ["labPatientName", "labMobile", "labTest", "labDate"], (values) => {
  let valid = true;
  if (!validateMobile(values.labMobile)) {
    setError("labMobile", "Enter a valid phone number.");
    valid = false;
  }
  if (values.labDate < document.querySelector("#labDate").min) {
    setError("labDate", "Choose today or a future date.");
    valid = false;
  }
  return valid;
});

document.querySelectorAll("[data-contact]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.contact === "call" ? "A verified hospital phone number" : "A verified hospital WhatsApp number";
    const hint = document.querySelector("#contactHint");
    hint.textContent = `${action} has not been configured. This demo cannot place calls or send messages.`;
    hint.hidden = false;
  });
});

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector("#main-nav");
menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
  mainNav.classList.toggle("is-open", !isOpen);
});
mainNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
  mainNav.classList.remove("is-open");
}));

setDateMinimum(document.querySelector("#appointmentDate"));
setDateMinimum(document.querySelector("#labDate"));
document.querySelector("#currentYear").textContent = new Date().getFullYear();
renderDoctors();
