/**
 * Site-wide English / Spanish toggle.
 * Default: English on first visit. Choice persists for the browser session
 * so Spanish stays active while navigating between pages.
 */
(function () {
  var STORAGE_KEY = "4e-lang";
  var DEFAULT_LANG = "en";

  var es = {
    /* Shared / nav */
    "4 Elements": "4 Elements",
    "Oilfield Services LLC": "Oilfield Services LLC",
    "Request a Quote": "Solicitar cotización",
    "Home": "Inicio",
    "Back to Home": "Volver al inicio",
    "Call (575) 941-3311": "Llamar al (575) 941-3311",
    "Ready to get started?": "¿Listo para comenzar?",
    "Call our Carlsbad office or request a quote - we serve SE New Mexico and West Texas.":
      "Llame a nuestra oficina en Carlsbad o solicite una cotización: atendemos el sureste de Nuevo México y el oeste de Texas.",
    "Request quote": "Solicitar cotización",
    "Contact": "Contacto",
    "Contact Trucking": "Contactar transporte",
    "Contact Construction": "Contactar construcción",
    "Contact Automotive": "Contactar automotriz",
    "Contact Safety": "Contactar seguridad",
    "Manager": "Gerente",
    "Email": "Correo",
    "Direct": "Directo",
    "Office": "Oficina",
    "Address": "Dirección",
    "Purchasing": "Compras",
    "Career Opportunities": "Oportunidades de empleo",
    "Division": "División",
    "Scroll down for more": "Desliza para ver más",
    "Scroll for more": "Desliza para más",
    "Affiliate": "Afiliado",
    "Services": "Servicios",
    "Affiliates": "Afiliados",
    "About": "Acerca de",

    /* Home */
    "Trucking Division": "División de Transporte",
    "Automotive & Diesel Repair": "Reparación Automotriz y Diésel",
    "Construction Division": "División de Construcción",
    "Safety Division": "División de Seguridad",
    "Hydrovac Division": "División de Hydrovac",
    "Contact Hydrovac": "Contactar Hydrovac",
    "Hydrovac and hydro excavation for oilfield and industrial work in the Permian Basin.":
      "Hydrovac e hidroexcavación para trabajo petrolero e industrial en la cuenca del Pérmico.",
    "The Hydrovac Division of 4 Elements Oilfield Services LLC provides hydrovac and hydro excavation for oilfield and industrial customers. Jobs are coordinated from the Carlsbad, New Mexico office at 1400 W. Derrick Rd.":
      "La División de Hydrovac de 4 Elements Oilfield Services LLC ofrece hydrovac e hidroexcavación para clientes petroleros e industriales. Los trabajos se coordinan desde la oficina de Carlsbad, Nuevo México, en 1400 W. Derrick Rd.",
    "Hydrovac services": "Servicios de hydrovac",
    "Tell us about the hydrovac or hydro excavation work you need. Quotes are handled through the Carlsbad office.":
      "Cuéntenos sobre el trabajo de hydrovac o hidroexcavación que necesita. Las cotizaciones se atienden a través de la oficina de Carlsbad.",
    "Service area": "Área de servicio",
    "From Carlsbad, 4 Elements arranges hydrovac work for customers in southeastern New Mexico, the Permian Basin, and West Texas.":
      "Desde Carlsbad, 4 Elements coordina trabajo de hydrovac para clientes en el sureste de Nuevo México, la cuenca del Pérmico y el oeste de Texas.",
    '4 Elements Oilfield Services LLC is based at 1400 W. Derrick Rd. in Carlsbad, New Mexico. The company provides <a href="/divisions/trucking">trucking</a>, <a href="/divisions/automotive">automotive and diesel repair</a>, <a href="/divisions/construction">construction</a>, <a href="/divisions/hydrovac">hydrovac and hydro excavation</a>, and <a href="/divisions/safety">safety</a> for oilfield, mining, and industrial work across the Permian Basin, including southeastern New Mexico and West Texas.':
      '4 Elements Oilfield Services LLC tiene su sede en 1400 W. Derrick Rd. en Carlsbad, Nuevo México. La empresa ofrece <a href="/divisions/trucking">transporte</a>, <a href="/divisions/automotive">reparación automotriz y diésel</a>, <a href="/divisions/construction">construcción</a>, <a href="/divisions/hydrovac">hydrovac e hidroexcavación</a> y <a href="/divisions/safety">seguridad</a> para trabajo petrolero, minero e industrial en la cuenca del Pérmico, incluido el sureste de Nuevo México y el oeste de Texas.',
    "Clean Air Authority": "Clean Air Authority",
    "Training Division": "División de Capacitación",
    "Zealous Electrical Services": "Zealous Electrical Services",
    "Automation": "Automatización",
    "Your One Stop Shop for Oilfield, Mining & Industrial Services in Carlsbad, NM":
      "Su centro integral de servicios petroleros, mineros e industriales en Carlsbad, NM",
    "When minutes, money, and mileage matter.":
      "Cuando importan los minutos, el dinero y el kilometraje.",
    "Related 4 Elements services": "Servicios relacionados de 4 Elements",
    "Belly dumps, end dumps, and dump trucks cover aggregate hauling. Heavy haul and semi flatbed trucks are available when the load needs them, and debris removal is on the same list. Tell the Carlsbad office which truck the job needs, or <a href=\"/trucking-quote\">request a trucking quote</a>. Aggregate hauling can be coordinated with <a href=\"/divisions/construction\">Construction</a> and with material from <a href=\"/affiliates/thunder-stone\">Thunder Stone Quarry</a>.":
      "Los belly dumps, end dumps y camiones de volteo cubren el transporte de agregados. Hay carga pesada y plataformas semi cuando la carga los necesita, y la remoción de escombros está en la misma lista. Dígale a la oficina de Carlsbad qué camión necesita el trabajo, o <a href=\"/trucking-quote\">solicite una cotización de transporte</a>. El transporte de agregados se puede coordinar con <a href=\"/divisions/construction\">Construcción</a> y con material de <a href=\"/affiliates/thunder-stone\">Thunder Stone Quarry</a>.",
    "The 4 Elements Trucking Division hauls aggregate and heavy equipment for oilfield, mining, and industrial customers from our yard at 1400 W. Derrick Rd. in Carlsbad, New Mexico, for work across the Permian Basin.":
      "La División de Transporte de 4 Elements transporta agregados y equipo pesado para clientes petroleros, mineros e industriales desde nuestro patio en 1400 W. Derrick Rd. en Carlsbad, Nuevo México, para trabajo en la cuenca del Pérmico.",
    "4 Elements Automotive & Diesel Repair is a full-service shop in Carlsbad, New Mexico. The shop works on passenger vehicles through large diesel trucks and heavy equipment for oilfield, mining, industrial, and commercial customers, in the shop and in the field.":
      "4 Elements Automotive & Diesel Repair es un taller de servicio completo en Carlsbad, Nuevo México. El taller trabaja en vehículos de pasajeros, camiones diésel grandes y equipo pesado para clientes petroleros, mineros, industriales y comerciales, en el taller y en el campo.",
    "Automotive and diesel repair": "Reparación automotriz y diésel",
    "The 4 Elements Construction Division builds and maintains oilfield and industrial sites from Carlsbad, New Mexico, with MSHA-trained operators, laborers, and welders. The work includes road and pad construction, heli pads, fencing and cattle guards, welding and fabrication, and reclamation or remediation, for customers in southeastern New Mexico, the Permian Basin, and West Texas.":
      "La División de Construcción de 4 Elements construye y mantiene sitios petroleros e industriales desde Carlsbad, Nuevo México, con operadores, obreros y soldadores capacitados por MSHA. El trabajo incluye construcción de caminos y pads, helipuertos, cercas y guardaganados, soldadura y fabricación, y reclamación o remediación, para clientes en el sureste de Nuevo México, la cuenca del Pérmico y el oeste de Texas.",
    "The 4 Elements Safety Division supports oilfield and industrial jobs in and around Carlsbad, New Mexico, and across southeastern New Mexico and West Texas, with technician oversight, permitting, and onsite safety equipment.":
      "La División de Seguridad de 4 Elements apoya trabajos petroleros e industriales en Carlsbad, Nuevo México y alrededores, y en el sureste de Nuevo México y el oeste de Texas, con supervisión técnica, permisos y equipo de seguridad en sitio.",
    "Clean Air Authority is a 4 Elements affiliate serving Carlsbad, New Mexico and the surrounding area with HVAC programs, installations, repairs, and Cummins generator sales and service.":
      "Clean Air Authority es un afiliado de 4 Elements que atiende Carlsbad, Nuevo México y el área circundante con programas de HVAC, instalaciones, reparaciones y venta y servicio de generadores Cummins.",
    "The 4 Elements Automation affiliate installs and maintains instrumentation, PLCs, field networks, and SCADA for oilfield and building projects served from Carlsbad, New Mexico.":
      "El afiliado de Automatización de 4 Elements instala y mantiene instrumentación, PLC, redes de campo y SCADA para proyectos petroleros y de edificios atendidos desde Carlsbad, Nuevo México.",
    "Zealous Electrical Services is a 4 Elements affiliate providing industrial, commercial, and residential electrical installation, repair, and maintenance in the Carlsbad, New Mexico area.":
      "Zealous Electrical Services es un afiliado de 4 Elements que ofrece instalación, reparación y mantenimiento eléctrico industrial, comercial y residencial en el área de Carlsbad, Nuevo México.",
    "The 4 Elements Training Division delivers oilfield lifesaving and equipment training from Carlsbad, New Mexico, including PEC Safeland and related safety classes.":
      "La División de Capacitación de 4 Elements ofrece entrenamiento de salvamento petrolero y de equipo desde Carlsbad, Nuevo México, incluyendo PEC Safeland y clases de seguridad relacionadas.",
    "Thunder Run Concrete is listed among the 4 Elements affiliates. Contact the Carlsbad office to coordinate concrete support with Construction and Trucking.":
      "Thunder Run Concrete figura entre los afiliados de 4 Elements. Contacte la oficina de Carlsbad para coordinar apoyo de concreto con Construcción y Transporte.",
    "Thunder Stone Quarry supports 4 Elements trucking and construction jobs with aggregate materials coordinated from Carlsbad, New Mexico.":
      "Thunder Stone Quarry apoya trabajos de transporte y construcción de 4 Elements con materiales agregados coordinados desde Carlsbad, Nuevo México.",
    "DroneOps Solutions, LLC is listed among the 4 Elements affiliates. Contact the Carlsbad office for current capabilities and project coordination.":
      "DroneOps Solutions, LLC figura entre los afiliados de 4 Elements. Contacte la oficina de Carlsbad para capacidades actuales y coordinación de proyectos.",

    /* Common CTA / roles */
    "Office Email": "Correo de oficina",
    "Office / HR": "Oficina / RR. HH.",
    "Hiring / Automation Manager": "Contratación / Gerente de Automatización",
    "Licenses": "Licencias",
    "Training Coordinator": "Coordinador de capacitación",
    "Coordinator Email": "Correo del coordinador",
    "Sales / Lifesaving Training Specialist": "Ventas / Especialista en capacitación de salvamento",
    "Purchasing / Business Development": "Compras / Desarrollo de negocios",
    "Apply CDL Online": "Solicitar CDL en línea",
    "CDL JotForm": "Formulario CDL JotForm",
    "Mechanic / Non-CDL Apply": "Solicitud mecánica / sin CDL",
    "General Application": "Solicitud general",
    "Apply Online": "Solicitar en línea",
    "Non-CDL Application": "Solicitud sin CDL",
    "Apply Non-CDL Online": "Solicitar sin CDL en línea",
    "Cummins QuickServe": "Cummins QuickServe",
    "Email Training Coordinator": "Correo al coordinador de capacitación",
    "Email Earl Phelps": "Correo a Earl Phelps",
    "Request Training or a Quote": "Solicitar capacitación o cotización",
    "Reach Jose Sifuentes or Earl Phelps to schedule classes or request pricing.":
      "Comuníquese con Jose Sifuentes o Earl Phelps para programar clases o solicitar precios.",

    /* Trucking */
    "Aggregate trucking and heavy haul across SE New Mexico and West Texas - when minutes, money, and mileage matter.":
      "Transporte de agregados y carga pesada en el sureste de Nuevo México y el oeste de Texas: cuando importan los minutos, el dinero y el kilometraje.",
    "Jeremiah Terrazas - Trucking Manager & Heavy Equipment Mechanic":
      "Jeremiah Terrazas - Gerente de Transporte y Mecánico de Equipo Pesado",
    "Trucking Capabilities": "Capacidades de transporte",
    "Aggregate Hauling": "Transporte de agregados",
    "Debris Removal": "Remoción de escombros",
    "Belly Dumps": "Volquetes de descarga inferior",
    "End Dumps": "Volquetes de descarga trasera",
    "Dump Trucks": "Camiones de volteo",
    "Heavy Haul": "Carga pesada",
    "Semi Flat Bed": "Plataforma semi",
    "JANUARY 2026 - Now hiring CDL Drivers (Belly Dump / End Dump / Dump Truck / Heavy Haul). <a href=\"/divisions/automotive\">Diesel / Heavy Equipment Mechanic</a> positions also recruiting.":
      "ENERO 2026 - Contratando conductores CDL (volquete inferior / trasero / camión de volteo / carga pesada). También se reclutan <a href=\"/divisions/automotive\">mecánicos diésel / de equipo pesado</a>.",
    "Must be 21+ with a valid CDL and 2 years driving experience for driver roles. Competitive hourly wages DOE, paid vacation/sick/holidays, 401(k), and health benefits. Pre-employment drug screen and clean driving record required. Housing and per diem are not provided. Call Jeremiah Terrazas (575) 636-4652 or HR (575) 988-5479. CDL applications must be completed online (assistance available at the Derrick Rd office).":
      "Debe tener 21+ años con CDL válido y 2 años de experiencia para puestos de conductor. Salarios por hora competitivos según experiencia, vacaciones/enfermedad/días festivos pagados, 401(k) y beneficios de salud. Se requiere prueba de drogas previa al empleo y buen historial de manejo. No se proporciona vivienda ni viáticos. Llame a Jeremiah Terrazas (575) 636-4652 o RR. HH. (575) 988-5479. Las solicitudes CDL deben completarse en línea (asistencia disponible en la oficina de Derrick Rd).",

    /* Automotive */
    "Full Service Automotive and Diesel Mechanic Service Center - keeping your fleet and equipment ready for the job.":
      "Centro de servicio mecánico automotriz y diésel de servicio completo: manteniendo su flota y equipo listos para el trabajo.",
    "Jake Tipton - Automotive Manager": "Jake Tipton - Gerente Automotriz",
    "The Carlsbad shop works on passenger vehicles and on the diesel trucks and heavy equipment used by oilfield, mining, industrial, and commercial customers. That includes fleet maintenance, preventive service programs, diagnostics and troubleshooting, shop work, and field support. Fleets that also need hauling can start with the <a href=\"/divisions/trucking\">Trucking Division</a>.":
      "El taller de Carlsbad trabaja en vehículos de pasajeros y en los camiones diésel y el equipo pesado que usan clientes petroleros, mineros, industriales y comerciales. Eso incluye mantenimiento de flotas, programas de servicio preventivo, diagnóstico y solución de problemas, trabajo en el taller y apoyo en el campo. Las flotas que también necesitan transporte pueden empezar con la <a href=\"/divisions/trucking\">División de Transporte</a>.",
    "Full Service Automotive Repair": "Reparación automotriz de servicio completo",
    "Full Service Diesel Mechanic Service": "Servicio mecánico diésel completo",
    "Heavy Equipment Repair": "Reparación de equipo pesado",
    "Fleet Maintenance": "Mantenimiento de flota",
    "Preventive Service Programs": "Programas de servicio preventivo",
    "Diagnostics and Troubleshooting": "Diagnóstico y solución de problemas",
    "Shop-Based Support": "Soporte en taller",
    "Field Support": "Soporte en campo",
    "JANUARY 2026 - Immediately hiring Diesel / Heavy Equipment Mechanic.":
      "ENERO 2026 - Contratación inmediata de mecánico diésel / de equipo pesado.",
    "Competitive hourly wages, paid vacation/sick/holidays, 401(k), and health benefits. Must pass a pre-employment drug screen and have a clean driving record. Clear English required; bilingual a plus. Call Trucking Manager Jeremiah Terrazas (575) 636-4652 or HR (575) 941-3311, or apply online / in person at the Derrick Rd office.":
      "Salarios por hora competitivos, vacaciones/enfermedad/días festivos pagados, 401(k) y beneficios de salud. Debe pasar prueba de drogas previa al empleo y tener buen historial de manejo. Se requiere inglés claro; bilingüe es una ventaja. Llame al gerente Jeremiah Terrazas (575) 636-4652 o RR. HH. (575) 941-3311, o solicite en línea / en persona en la oficina de Derrick Rd.",

    /* Construction */
    "Heavy equipment construction, reclamation/remediation, and maintenance - with trucking, quarry materials, safety techs, and project management available under a single bid.":
      "Construcción con equipo pesado, reclamación/remediación y mantenimiento, con transporte, materiales de cantera, técnicos de seguridad y gestión de proyectos disponibles bajo una sola oferta.",
    "Daniel Vasquez - Construction Manager": "Daniel Vasquez - Gerente de Construcción",
    "Construction Capabilities": "Capacidades de construcción",
    "Operators, laborers, and welders are all MSHA trained and recruited, hired, trained, and maintained within an in-house safety culture.":
      "Operadores, obreros y soldadores tienen capacitación MSHA y son reclutados, contratados, capacitados y mantenidos dentro de una cultura de seguridad interna.",
    "Heavy Equipment Construction": "Construcción con equipo pesado",
    "New Road Construction & Repair": "Construcción y reparación de caminos nuevos",
    "Pad Building and Extensions": "Construcción y ampliación de pads",
    "Heli Pad Construction": "Construcción de helipuertos",
    "Fence Building / Cattle Guards": "Construcción de cercas / guardaganados",
    "Welding & Fabrication": "Soldadura y fabricación",
    "Laborers and Maintenance Personnel": "Obreros y personal de mantenimiento",
    "Reclamation / Remediation": "Reclamación / Remediación",
    "On construction jobs, 4 Elements can source our own <a href=\"/divisions/trucking\">trucking</a>, <a href=\"/affiliates/thunder-stone\">quarry materials</a>, <a href=\"/divisions/safety\">safety techs</a>, and project management under a single bid.":
      "En trabajos de construcción, 4 Elements puede proporcionar su propio <a href=\"/divisions/trucking\">transporte</a>, <a href=\"/affiliates/thunder-stone\">materiales de cantera</a>, <a href=\"/divisions/safety\">técnicos de seguridad</a> y gestión de proyectos bajo una sola oferta.",
    "NOV 2025 - Now hiring for <a href=\"/divisions/hydrovac\">Hydrovac</a> Driver / Operator. Applications for heavy equipment and laborer positions are kept on file for 6 months.":
      "NOV 2025 - Contratando conductor/operador de <a href=\"/divisions/hydrovac\">hydrovac</a>. Las solicitudes para equipo pesado y obreros se conservan 6 meses.",
    "Construction applications can be picked up at 1400 W. Derrick Rd, requested from HR, or completed online.":
      "Las solicitudes de construcción se pueden recoger en 1400 W. Derrick Rd, solicitar a RR. HH. o completar en línea.",

    /* Safety */
    "Safety oversight, permitting, equipment sales and service, and onsite support for oilfield and industrial operations.":
      "Supervisión de seguridad, permisos, venta y servicio de equipo, y apoyo en sitio para operaciones petroleras e industriales.",
    "Dustin Higgins - Safety Manager": "Dustin Higgins - Gerente de Seguridad",
    "Safety Capabilities & Commodities": "Capacidades y equipos de seguridad",
    "If the job needs a technician on site, the division covers confined space, hot work, and excavation oversight, plus permitting and safety supervision. If the job needs equipment on site, the Carlsbad office sells and supports hydration standby, Norm monitoring, fire extinguishers, air, shower, rescue, and cool-down trailers, a Durahoist, and positive pressure fans.":
      "Si el trabajo necesita un técnico en el sitio, la división cubre supervisión de espacios confinados, trabajos en caliente y excavaciones, además de permisos y supervisión de seguridad. Si el trabajo necesita equipo en el sitio, la oficina de Carlsbad vende y apoya hidratación de reserva, monitoreo NORM, extinguidoras, remolques de aire, duchas, rescate y enfriamiento, un Durahoist y ventiladores de presión positiva.",
    "Technician Oversight & Consulting": "Supervisión y consultoría de técnicos",
    "Confined Space Oversight": "Supervisión de espacios confinados",
    "Hot Works Oversight": "Supervisión de trabajos en caliente",
    "Excavation Oversight": "Supervisión de excavaciones",
    "Permitting": "Permisos",
    "Safety Oversight Supervision / Consulting": "Supervisión / consultoría de seguridad",
    "Equipment, Sales & Onsite Support": "Equipo, ventas y apoyo en sitio",
    "Hydration Standby and Supplies": "Hidratación de reserva y suministros",
    "Norm Monitoring": "Monitoreo NORM",
    "Fire Extinguisher Sales / Services / Inspections": "Venta / servicio / inspección de extinguidoras",
    "Air Trailers": "Remolques de aire",
    "Shower Trailers": "Remolques de duchas",
    "Rescue Trailers": "Remolques de rescate",
    "Cool Down Trailers": "Remolques de enfriamiento",
    "Durahoist": "Durahoist",
    "Positive Pressure Fans": "Ventiladores de presión positiva",
    "Safety Equipment Sales and Service": "Venta y servicio de equipo de seguridad",
    "NOV 2025 - Positions have been filled. Applications are encouraged and kept on file for 6 months when openings arise.":
      "NOV 2025 - Los puestos han sido cubiertos. Se fomentan las solicitudes y se conservan 6 meses ante nuevas vacantes.",
    "Applications can be picked up at 1400 W. Derrick Rd, requested from HR, or completed online.":
      "Las solicitudes se pueden recoger en 1400 W. Derrick Rd, solicitar a RR. HH. o completar en línea.",

    /* Clean Air */
    "HVAC preventive maintenance, installation, repair, and Cummins generator sales & service for residential, commercial, and industrial customers.":
      "Mantenimiento preventivo, instalación y reparación de HVAC, y venta y servicio de generadores Cummins para clientes residenciales, comerciales e industriales.",
    "Don Knealing - Licensed HVAC (NM License #418542, Exp 11/30/27)":
      "Don Knealing - HVAC con licencia (Licencia NM #418542, vence 11/30/27)",
    "HVAC & Generator Services": "Servicios de HVAC y generadores",
    "Residential / Commercial and Industrial HVAC Preventive Maintenance Programs":
      "Programas de mantenimiento preventivo HVAC residencial / comercial e industrial",
    "New Installations and Retrofit Installations of HVAC Systems":
      "Instalaciones nuevas y reacondicionadas de sistemas HVAC",
    "Residential / Commercial and Industrial HVAC Repairs":
      "Reparaciones HVAC residenciales / comerciales e industriales",
    "Cummins Generator Sales and Services": "Venta y servicio de generadores Cummins",
    "Shearer Authorized Sales and Services": "Venta y servicio autorizado Shearer",
    "American Standard Authorized Sales and Service": "Venta y servicio autorizado American Standard",
    "Samsung Authorized Sales and Service": "Venta y servicio autorizado Samsung",
    "Authorized Dealer / Service": "Distribuidor / servicio autorizado",
    "Cummins Generator Authorized Dealer and Certified Service Center":
      "Distribuidor autorizado y centro de servicio certificado de generadores Cummins",
    "Bryant Authorized Dealer, Installation and Service Center":
      "Distribuidor autorizado Bryant, instalación y servicio",
    "American Standard Heating & Air Conditioning Authorized Dealer, Installation and Service Center":
      "Distribuidor autorizado American Standard Heating & Air Conditioning, instalación y servicio",
    "Cummins Generators": "Generadores Cummins",
    "Clean Air Authority and 4 Elements Oilfield Services LLC are certified as a Cummins Authorized Dealer and Service Shop for Cummins Generators - for personal, home, and industrial generator needs.":
      "Clean Air Authority y 4 Elements Oilfield Services LLC están certificados como distribuidor y taller de servicio autorizado Cummins para generadores personales, residenciales e industriales.",
    "NOVEMBER 2025 / JANUARY 2026 - Immediately hiring Journeyman Plumber for SE NM and West TX (industrial / commercial focus, some residential).":
      "NOVIEMBRE 2025 / ENERO 2026 - Contratación inmediata de plomero oficial (journeyman) para SE NM y el oeste de TX (enfoque industrial / comercial, algo residencial).",
    "Competitive hourly wages DOE, paid vacation/sick/holidays, 401(k), and health benefits. Call HR at (575) 941-3311 or apply online / in person at the Derrick Rd office.":
      "Salarios por hora competitivos según experiencia, vacaciones/enfermedad/días festivos pagados, 401(k) y beneficios de salud. Llame a RR. HH. al (575) 941-3311 o solicite en línea / en persona en la oficina de Derrick Rd.",

    /* Automation */
    "Install, maintain, and program instrumentation, PLCs/VFDs. Create field networks, comms/cameras and SCADA. Building automation HVACR controls and fully automated holiday displays.":
      "Instalar, mantener y programar instrumentación, PLCs/VFDs. Crear redes de campo, comunicaciones/cámaras y SCADA. Automatización de edificios, controles HVACR y pantallas navideñas totalmente automatizadas.",
    "Lance Moore - Automation Manager": "Lance Moore - Gerente de Automatización",
    "TX Master Plumber #38513 · TX Journeyman Plumber #40575 · TX Journeyman Electrician #667657":
      "Plomero maestro TX #38513 · Plomero oficial TX #40575 · Electricista oficial TX #667657",
    "Automation Capabilities": "Capacidades de automatización",
    "Oilfield Automation": "Automatización petrolera",
    "Residential / Commercial Building Automation": "Automatización de edificios residenciales / comerciales",
    "Audio Visual and Sound Installations": "Instalaciones audiovisuales y de sonido",
    "Distillery and Brewery Automation": "Automatización de destilerías y cervecerías",
    "Fully Automated Holiday Light and Sound Displays":
      "Pantallas navideñas de luz y sonido totalmente automatizadas",
    "Residential / Commercial Security Systems": "Sistemas de seguridad residenciales / comerciales",
    "Residential / Commercial Surveillance Systems":
      "Sistemas de vigilancia residenciales / comerciales",
    "Networking and Wireless Communications": "Redes y comunicaciones inalámbricas",
    "Platforms & Brands": "Plataformas y marcas",
    "Authorized Dealer / Installation": "Distribuidor / instalación autorizado",
    "Alarm.Com - Sales, Installation and Integration": "Alarm.Com - Venta, instalación e integración",
    "Clare One - Sales, Installation and Integration": "Clare One - Venta, instalación e integración",
    "Honeywell - Sales, Installation and Integration": "Honeywell - Venta, instalación e integración",
    "Snap One - Sales, Installation and Integration": "Snap One - Venta, instalación e integración",
    "Toshiba - Sales, Installation and Integration": "Toshiba - Venta, instalación e integración",
    "Yaskawa - Sales, Installation and Integration": "Yaskawa - Venta, instalación e integración",
    "NOV 2025 - Automation Tech position available.":
      "NOV 2025 - Puesto de técnico de automatización disponible.",
    "Applications can be picked up at the office, requested from HR, or completed online.":
      "Las solicitudes se pueden recoger en la oficina, solicitar a RR. HH. o completar en línea.",

    /* Zealous */
    "Industrial, commercial, and residential electrical installation, repair, and maintenance.":
      "Instalación, reparación y mantenimiento eléctricos industriales, comerciales y residenciales.",
    "Electrical Services": "Servicios eléctricos",
    "Industrial Electrical Installation, Repair and Maintenance":
      "Instalación, reparación y mantenimiento eléctricos industriales",
    "Commercial Electrical Installation, Repair and Maintenance":
      "Instalación, reparación y mantenimiento eléctricos comerciales",
    "Residential Electrical Installation, Repair and Maintenance":
      "Instalación, reparación y mantenimiento eléctricos residenciales",
    "NOV 2025 / JANUARY 2026 - Current openings for Certified Licensed Electrician and Journeyman Electricians (SE NM and West TX, industrial / commercial focus).":
      "NOV 2025 / ENERO 2026 - Vacantes actuales para electricista certificado con licencia y electricistas oficiales (SE NM y oeste de TX, enfoque industrial / comercial).",
    "Competitive hourly wages DOE, paid vacation/sick/holidays, 401(k), and health benefits. Call Lance Moore (806) 292-1078 or HR (575) 941-3311, or apply online / in person.":
      "Salarios por hora competitivos según experiencia, vacaciones/enfermedad/días festivos pagados, 401(k) y beneficios de salud. Llame a Lance Moore (806) 292-1078 o RR. HH. (575) 941-3311, o solicite en línea / en persona.",

    /* Training */
    "Oilfield lifesaving and MSHA training instructors - PEC Safeland, lifesaving skills, equipment training, and authorized safety product distribution.":
      "Instructores de salvamento petrolero y capacitación MSHA: PEC Safeland, habilidades de salvamento, capacitación de equipo y distribución autorizada de productos de seguridad.",
    "Jose Sifuentes": "Jose Sifuentes",
    "Training Classes & Sales": "Clases de capacitación y ventas",
    "PEC Safeland": "PEC Safeland",
    "Veriforce / PEC Safe Driver": "Veriforce / PEC Safe Driver",
    "H2S Clear": "H2S Clear",
    "Stop The Bleed / First Aid / CPR": "Stop The Bleed / Primeros auxilios / RCP",
    "AED Devices and Instruction": "Dispositivos DEA e instrucción",
    "Rope Rescue": "Rescate con cuerdas",
    "Confined Space": "Espacios confinados",
    "Hot Work": "Trabajos en caliente",
    "Benzene Awareness": "Concientización sobre benceno",
    "Boom Lift": "Elevador articulado",
    "Excavation": "Excavación",
    "Forklift": "Montacargas",
    "Earthmoving Equipment": "Equipo de movimiento de tierra",
    "Lock Out / Tag Out": "Bloqueo / etiquetado (LOTO)",
    "Specific Training Upon Request": "Capacitación específica bajo pedido",
    "Products & Distributorships": "Productos y distribuidores",
    "Contact Earl Phelps for quotes or more information on product lines and fit testing.":
      "Contacte a Earl Phelps para cotizaciones o más información sobre líneas de productos y pruebas de ajuste.",
    "My Medic licensed distributor": "Distribuidor autorizado My Medic",
    "Respirator Fit Testing and Online Medical Clearance":
      "Prueba de ajuste de respirador y autorización médica en línea",
    "PowerFlare licensed distributor": "Distribuidor autorizado PowerFlare",
    "Enola Gaye smoke grenade licensed distributor":
      "Distribuidor autorizado de granadas de humo Enola Gaye",
    "Phillips AED licensed distributor": "Distribuidor autorizado Phillips AED",
    "AVERT active shooter supplies: tac-pacs and cabinets":
      "Suministros AVERT para tirador activo: tac-pacs y gabinetes",

    /* Thunder / Drone */
    "Affiliate partner of 4 Elements Oilfield Services LLC supporting concrete needs alongside our construction and trucking divisions.":
      "Socio afiliado de 4 Elements Oilfield Services LLC que apoya necesidades de concreto junto con nuestras divisiones de construcción y transporte.",
    "Thunder Run Concrete is listed among the 4 Elements affiliate partners. Contact our Carlsbad office for availability, project support, and coordination with Construction and Trucking.":
      "Thunder Run Concrete figura entre los socios afiliados de 4 Elements. Contacte nuestra oficina en Carlsbad para disponibilidad, apoyo de proyectos y coordinación con Construcción y Transporte.",
    "Affiliate quarry partner supporting aggregate materials for trucking and construction projects.":
      "Socio de cantera afiliado que abastece materiales agregados para proyectos de transporte y construcción.",
    "Thunder Stone Quarry is listed among the 4 Elements affiliate partners. On construction jobs, 4 Elements can source quarry materials together with trucking, safety techs, and project management under a single bid. Contact the office for material and delivery coordination.":
      "Thunder Stone Quarry figura entre los socios afiliados de 4 Elements. En trabajos de construcción, 4 Elements puede obtener materiales de cantera junto con transporte, técnicos de seguridad y gestión de proyectos bajo una sola oferta. Contacte la oficina para coordinación de materiales y entrega.",
    "DroneOps Solutions, LLC - affiliate partner of 4 Elements Oilfield Services LLC.":
      "DroneOps Solutions, LLC - socio afiliado de 4 Elements Oilfield Services LLC.",
    "DroneOps Solutions, LLC is listed among the 4 Elements affiliate partners. Contact our Carlsbad office for current capabilities and project coordination.":
      "DroneOps Solutions, LLC figura entre los socios afiliados de 4 Elements. Contacte nuestra oficina en Carlsbad para capacidades actuales y coordinación de proyectos.",

    /* Quotes */
    "Request a quote for aggregate trucking, dumps, or heavy haul across SE New Mexico and West Texas.":
      "Solicite una cotización para transporte de agregados, volquetes o carga pesada en el sureste de Nuevo México y el oeste de Texas.",
    "Request a quote for automotive and diesel repair services.":
      "Solicite una cotización para servicios de reparación automotriz y diésel.",
    "Request a quote for construction and heavy equipment services.":
      "Solicite una cotización para servicios de construcción y equipo pesado.",
    "Request a quote for safety oversight, permitting, and equipment services.":
      "Solicite una cotización para supervisión de seguridad, permisos y servicios de equipo.",
    "Submissions are routed to our Trucking Division team at":
      "Los envíos se dirigen a nuestro equipo de la División de Transporte en",
    "Submissions are routed to our Automotive Division team at":
      "Los envíos se dirigen a nuestro equipo de la División Automotriz en",
    "Submissions are routed to our Construction Division team at":
      "Los envíos se dirigen a nuestro equipo de la División de Construcción en",
    "Submissions are routed to our Safety Division team at":
      "Los envíos se dirigen a nuestro equipo de la División de Seguridad en",
    "Name": "Nombre",
    "Company": "Empresa",
    "Phone": "Teléfono",
    "Service Needed": "Servicio necesario",
    "Select a service": "Seleccione un servicio",
    "Job Location / Area": "Ubicación / área del trabajo",
    "City, county, or lease": "Ciudad, condado o lease",
    "Project Details": "Detalles del proyecto",
    "Timeline, tonnage, equipment needs, site notes, etc.":
      "Cronograma, tonelaje, equipo necesario, notas del sitio, etc.",
    "Send Quote Request": "Enviar solicitud de cotización",
    "Timeline, quantities, equipment needs, or other details":
      "Cronograma, cantidades, equipo necesario u otros detalles",
    "Back to Trucking Division": "Volver a División de Transporte",
    "Back to Automotive & Diesel Repair": "Volver a Reparación Automotriz y Diésel",
    "Back to Construction Division": "Volver a División de Construcción",
    "Back to Safety Division": "Volver a División de Seguridad",
    "Trucking Quote": 'Cotización de <span class="text-accent">Transporte</span>',
    "Automotive Quote": 'Cotización <span class="text-accent">Automotriz</span>',
    "Construction Quote": 'Cotización de <span class="text-accent">Construcción</span>',
    "Safety Quote": 'Cotización de <span class="text-accent">Seguridad</span>',
    "Diesel & heavy equipment repair": "Reparación diésel y de equipo pesado",
    "Fleet maintenance": "Mantenimiento de flota",
    "Preventive service programs": "Programas de servicio preventivo",
    "Diagnostics and troubleshooting": "Diagnóstico y solución de problemas",
    "Shop-based and field support": "Soporte en taller y en campo",
    "Submissions are routed to our Trucking Division team at PURCHASING@4ELEMENTSOILFIELD.COM.":
      'Los envíos se dirigen a nuestro equipo de la <strong>División de Transporte</strong> en <a href="mailto:PURCHASING@4ELEMENTSOILFIELD.COM">PURCHASING@4ELEMENTSOILFIELD.COM</a>.',
    "Submissions are routed to our Automotive Division team at PURCHASING@4ELEMENTSOILFIELD.COM.":
      'Los envíos se dirigen a nuestro equipo de la <strong>División Automotriz</strong> en <a href="mailto:PURCHASING@4ELEMENTSOILFIELD.COM">PURCHASING@4ELEMENTSOILFIELD.COM</a>.',
    "Submissions are routed to our Construction Division team at PURCHASING@4ELEMENTSOILFIELD.COM.":
      'Los envíos se dirigen a nuestro equipo de la <strong>División de Construcción</strong> en <a href="mailto:PURCHASING@4ELEMENTSOILFIELD.COM">PURCHASING@4ELEMENTSOILFIELD.COM</a>.',
    "Submissions are routed to our Safety Division team at PURCHASING@4ELEMENTSOILFIELD.COM.":
      'Los envíos se dirigen a nuestro equipo de la <strong>División de Seguridad</strong> en <a href="mailto:PURCHASING@4ELEMENTSOILFIELD.COM">PURCHASING@4ELEMENTSOILFIELD.COM</a>.',
    "1400 W. Derrick Rd., Carlsbad, NM 88220 · 4 Elements Oilfield Services LLC":
      "1400 W. Derrick Rd., Carlsbad, NM 88220 · 4 Elements Oilfield Services LLC",
    "ABB TOTALFLOW": "ABB TOTALFLOW",
    "IDEC": "IDEC",
    "OLEUMTECH": "OLEUMTECH",
    "TRIDIUM / NIAGARA": "TRIDIUM / NIAGARA",
    "IGNITION": "IGNITION",
    "SNAP ONE": "SNAP ONE",
    "CLARE ONE": "CLARE ONE",
    "ALARM.COM": "ALARM.COM",
    "TRIAD SOUND": "TRIAD SOUND",
    "HONEYWELL": "HONEYWELL",
    "ABB": "ABB",
    "SQUARE D": "SQUARE D",
    "EATON": "EATON",
    "PHOENIX": "PHOENIX",
    "TOSHIBA": "TOSHIBA",
    "YASKAWA": "YASKAWA",
    "SIEMENS": "SIEMENS",
    "SCADAPAK": "SCADAPAK",
    "SCHNEIDER ELECTRIC": "SCHNEIDER ELECTRIC",
    "ALLEN BRADLEY": "ALLEN BRADLEY",
    "MAPLE": "MAPLE",
    "RED LION": "RED LION",
    "UBIQUITI": "UBIQUITI",
    "FLOWCO": "FLOWCO",
    "ENDRESS & HAUSER": "ENDRESS & HAUSER",
    "Other / not listed": "Otro / no listado",
    "Aggregate trucking": "Transporte de agregados",
    "Belly dumps": "Volquetes de descarga inferior",
    "End dumps": "Volquetes de descarga trasera",
    "Dump trucks": "Camiones de volteo",
    "Heavy haul": "Carga pesada",
    "Heavy equipment construction": "Construcción con equipo pesado",
    "Reclamation & remediation": "Reclamación y remediación",
    "Site maintenance": "Mantenimiento de sitio",
    "Dirt work and civil support": "Movimiento de tierra y apoyo civil",
    "Project coordination": "Coordinación de proyectos",
    "Safety oversight & consulting": "Supervisión y consultoría de seguridad",
    "Confined space / hot work / excavation permitting":
      "Permisos de espacios confinados / trabajo en caliente / excavación",
    "Safety equipment sales & service": "Venta y servicio de equipo de seguridad",
    "Hydration sales, service & onsite support":
      "Venta, servicio y soporte en sitio de hidratación",
    "Shower facilities": "Instalaciones de duchas",
  };

  function getLang() {
    try {
      var stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored === "es" || stored === "en") return stored;
    } catch (e) { /* ignore */ }
    return DEFAULT_LANG;
  }

  function setLang(lang) {
    try {
      sessionStorage.setItem(STORAGE_KEY, lang);
    } catch (e) { /* ignore */ }
  }

  function ensureSource(el) {
    if (!el.hasAttribute("data-i18n-src")) {
      el.setAttribute("data-i18n-src", el.innerHTML.trim());
    }
    return el.getAttribute("data-i18n-src");
  }

  function translateHtml(src, lang) {
    if (lang === "en") return src;
    // Try exact match on plain text (strip tags for lookup when no HTML)
    var plain = src.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (es[src]) return es[src];
    if (es[plain]) {
      // Preserve simple accent span for Oilfield if present
      if (src.indexOf('class="text-accent"') !== -1 && plain.indexOf("Oilfield") !== -1) {
        return es[plain]
          .replace("petroleros", '<span class="text-accent">petroleros</span>')
          .replace("Oilfield", '<span class="text-accent">Oilfield</span>');
      }
      return es[plain];
    }
    // Tagline special case kept as structured HTML keys
    if (src.indexOf("One Stop Shop") !== -1) {
      return 'Su centro integral de servicios <span class="text-accent">petroleros</span>, mineros e industriales en Carlsbad, NM';
    }
    return src;
  }

  function normalizeKey(html) {
    return html
      .replace(/&amp;/g, "&")
      .replace(/&nbsp;/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .replace(/\s*\*\s*$/, "")
      .trim();
  }

  function lookup(src, lang) {
    if (lang === "en") return null;
    if (Object.prototype.hasOwnProperty.call(es, src)) return es[src];
    var plain = normalizeKey(src);
    if (Object.prototype.hasOwnProperty.call(es, plain)) return es[plain];
    return null;
  }

  function applyTranslations(lang) {
    document.documentElement.lang = lang === "es" ? "es" : "en";

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      // Never translate brand image links
      if (el.classList.contains("page-header__brand") || el.classList.contains("home-header__brand")) {
        return;
      }
      var src = ensureSource(el);
      if (!src) return;
      if (lang === "en") {
        el.innerHTML = src;
        return;
      }
      // The accent span closes before the comma, which is read as "Oilfield , Mining".
      if (src.indexOf(">Oilfield</span>,") !== -1) {
        el.innerHTML = src.replace(">Oilfield</span>,", ">Oilfield,</span>");
        return;
      }
      var translated = lookup(src, lang);
      if (translated == null) return;

      // Preserve required asterisk markers in labels
      if (/<span[^>]*aria-hidden/i.test(src) && translated.indexOf("*") === -1) {
        el.innerHTML = translated + ' <span aria-hidden="true">*</span>';
      } else if (/class="text-accent"/i.test(src) && translated.indexOf("text-accent") === -1) {
        // Wrap last accent-worthy keyword if original had accent span
        el.innerHTML = translated;
      } else {
        el.innerHTML = translated;
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      if (!el.hasAttribute("data-i18n-ph-src")) {
        el.setAttribute("data-i18n-ph-src", el.getAttribute("placeholder") || "");
      }
      var src = el.getAttribute("data-i18n-ph-src");
      var translated = lookup(src, lang);
      el.setAttribute("placeholder", translated != null ? translated : src);
    });

    document.querySelectorAll(".lang-switch [data-lang]").forEach(function (btn) {
      var active = btn.getAttribute("data-lang") === lang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function buildSwitcher() {
    var wrap = document.createElement("div");
    wrap.className = "lang-switch";
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", "Language");
    wrap.innerHTML =
      '<button type="button" class="lang-switch__btn" data-lang="en" aria-pressed="true">EN</button>' +
      '<button type="button" class="lang-switch__btn" data-lang="es" aria-pressed="false">ES</button>';
    wrap.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-lang]");
      if (!btn) return;
      var lang = btn.getAttribute("data-lang");
      setLang(lang);
      applyTranslations(lang);
    });
    return wrap;
  }

  function mountSwitcher() {
    var hosts = document.querySelectorAll(".home-header__inner, .page-header__inner");
    hosts.forEach(function (inner) {
      if (inner.querySelector(".lang-switch")) return;
      inner.appendChild(buildSwitcher());
    });
  }

  function init() {
    mountSwitcher();
    applyTranslations(getLang());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.FourElementsI18n = {
    setLang: function (lang) {
      setLang(lang);
      applyTranslations(lang);
    },
    getLang: getLang,
  };
})();
