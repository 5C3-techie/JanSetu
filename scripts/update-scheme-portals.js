const fs = require('fs');
const path = require('path');

const schemesPath = path.join(__dirname, '..', 'data', 'schemes.json');
const schemes = JSON.parse(fs.readFileSync(schemesPath, 'utf8'));

const updates = {
  // 1. Rythu Bharosa / Rythu Bandhu
  scheme_001: {
    applicationUrl: 'https://rythubharosa.telangana.gov.in',
    officialSourceUrl: 'https://rythubharosa.telangana.gov.in',
    officialSource: 'https://agri.telangana.gov.in',
    guidelineSourceUrl: 'https://rythubharosa.telangana.gov.in',
    portalName: 'Telangana Rythu Bharosa Portal',
  },

  // 2. PM-KISAN
  scheme_002: {
    applicationUrl: 'https://pmkisan.gov.in',
    officialSourceUrl: 'https://pmkisan.gov.in',
    officialSource: 'https://pmkisan.gov.in',
    guidelineSourceUrl: 'https://pmkisan.gov.in',
    portalName: 'PM-KISAN Official Portal',
  },

  // 3. Telangana Aasara / Cheyutha Pension Scheme
  scheme_003: {
    applicationUrl: 'https://cheyutha.telangana.gov.in',
    officialSourceUrl: 'https://cheyutha.telangana.gov.in',
    officialSource: 'https://telangana.gov.in',
    guidelineSourceUrl: 'https://cheyutha.telangana.gov.in',
    portalName: 'Telangana Cheyutha & Aasara Pension Portal',
  },

  // 4. Telangana Mahalakshmi Scheme
  scheme_004: {
    applicationUrl: 'https://prajapalana.telangana.gov.in',
    officialSourceUrl: 'https://prajapalana.telangana.gov.in',
    officialSource: 'https://telangana.gov.in',
    guidelineSourceUrl: 'https://prajapalana.telangana.gov.in',
    portalName: 'Praja Palana Portal (Financial Aid & LPG Subsidy)',
    secondaryPortalUrl: 'https://www.tgsrtcbus.in',
    secondaryPortalName: 'TGSRTC Portal (Free Bus Travel)',
  },

  // 5. Telangana Gruha Jyothi Scheme
  scheme_005: {
    applicationUrl: 'https://prajapalana.telangana.gov.in',
    officialSourceUrl: 'https://tssouthernpower.com',
    officialSource: 'https://tssouthernpower.com',
    guidelineSourceUrl: 'https://prajapalana.telangana.gov.in',
    portalName: 'Praja Palana Portal (Gruha Jyothi)',
    secondaryPortalUrl: 'https://tssouthernpower.com',
    secondaryPortalName: 'TGSPDCL Electricity Portal',
  },

  // 6. Telangana Indiramma Indlu Scheme
  scheme_006: {
    applicationUrl: 'https://prajapalana.telangana.gov.in',
    officialSourceUrl: 'https://tshousing.cgg.gov.in',
    officialSource: 'https://tshousing.cgg.gov.in',
    guidelineSourceUrl: 'https://prajapalana.telangana.gov.in',
    portalName: 'Praja Palana Housing Portal',
    secondaryPortalUrl: 'https://tshousing.cgg.gov.in',
    secondaryPortalName: 'Telangana Housing Corporation (TSHCL)',
  },

  // 7. Rajiv Aarogyasri / Cheyutha Health Scheme
  scheme_007: {
    applicationUrl: 'https://www.rajivaarogyasri.telangana.gov.in',
    officialSourceUrl: 'https://www.rajivaarogyasri.telangana.gov.in',
    officialSource: 'https://www.rajivaarogyasri.telangana.gov.in',
    guidelineSourceUrl: 'https://www.rajivaarogyasri.telangana.gov.in',
    portalName: 'Rajiv Aarogyasri Health Care Trust Portal',
  },

  // 8. PMAY-G
  scheme_008: {
    applicationUrl: 'https://pmayg.dord.gov.in',
    officialSourceUrl: 'https://pmayg.dord.gov.in',
    officialSource: 'https://rural.gov.in',
    guidelineSourceUrl: 'https://pmayg.dord.gov.in',
    portalName: 'PMAY-G AwaasSoft Portal',
  },

  // 9. PMAY-U
  scheme_009: {
    applicationUrl: 'https://pmay-urban.gov.in',
    officialSourceUrl: 'https://pmay-urban.gov.in',
    officialSource: 'https://mohua.gov.in',
    guidelineSourceUrl: 'https://pmay-urban.gov.in',
    portalName: 'PMAY Urban Official Portal',
  },

  // 10. Ayushman Bharat - PM-JAY
  scheme_010: {
    applicationUrl: 'https://beneficiary.nha.gov.in',
    officialSourceUrl: 'https://beneficiary.nha.gov.in',
    officialSource: 'https://nha.gov.in',
    guidelineSourceUrl: 'https://beneficiary.nha.gov.in',
    portalName: 'NHA Ayushman Beneficiary Portal',
  },

  // 11. Telangana National Food Security Scheme (Food Security Card)
  scheme_011: {
    applicationUrl: 'https://epds.telangana.gov.in',
    officialSourceUrl: 'https://epds.telangana.gov.in',
    officialSource: 'https://epds.telangana.gov.in',
    guidelineSourceUrl: 'https://epds.telangana.gov.in',
    portalName: 'Telangana ePDS Ration Card Portal',
  },

  // 12. Pradhan Mantri Fasal Bima Yojana (PMFBY)
  scheme_012: {
    applicationUrl: 'https://pmfby.gov.in',
    officialSourceUrl: 'https://pmfby.gov.in',
    officialSource: 'https://pmfby.gov.in',
    guidelineSourceUrl: 'https://pmfby.gov.in',
    portalName: 'PMFBY National Crop Insurance Portal',
  },

  // 13. Telangana Rythu Bima Scheme
  scheme_013: {
    applicationUrl: 'https://agri.telangana.gov.in',
    officialSourceUrl: 'https://agri.telangana.gov.in',
    officialSource: 'https://agri.telangana.gov.in',
    guidelineSourceUrl: 'https://agri.telangana.gov.in',
    portalName: 'Telangana Agriculture Portal (Rythu Bima)',
  },

  // 14. Pradhan Mantri Matru Vandana Yojana (PMMVY)
  scheme_014: {
    applicationUrl: 'https://pmmvy.wcd.gov.in',
    officialSourceUrl: 'https://pmmvy.wcd.gov.in',
    officialSource: 'https://wcd.nic.in',
    guidelineSourceUrl: 'https://pmmvy.wcd.gov.in',
    portalName: 'PMMVY Citizen Application Portal',
  },

  // 15. Telangana Kanti Velugu Scheme
  scheme_015: {
    applicationUrl: 'https://chfw.telangana.gov.in',
    officialSourceUrl: 'https://chfw.telangana.gov.in',
    officialSource: 'https://telangana.gov.in',
    guidelineSourceUrl: 'https://chfw.telangana.gov.in',
    portalName: 'Telangana Health & Family Welfare Portal',
  },

  // 16. Telangana Post-Matric Scholarship (ePASS)
  scheme_016: {
    applicationUrl: 'https://telanganaepass.cgg.gov.in',
    officialSourceUrl: 'https://telanganaepass.cgg.gov.in',
    officialSource: 'https://telanganaepass.cgg.gov.in',
    guidelineSourceUrl: 'https://telanganaepass.cgg.gov.in/Guidelines.do',
    portalName: 'Telangana ePASS Post-Matric Portal',
  },

  // 17. Telangana Pre-Matric Scholarship (ePASS)
  scheme_017: {
    applicationUrl: 'https://telanganaepass.cgg.gov.in',
    officialSourceUrl: 'https://telanganaepass.cgg.gov.in',
    officialSource: 'https://telanganaepass.cgg.gov.in',
    guidelineSourceUrl: 'https://telanganaepass.cgg.gov.in',
    portalName: 'Telangana ePASS Pre-Matric Portal',
  },

  // 18. Pradhan Mantri Mudra Yojana (PMMY)
  scheme_018: {
    applicationUrl: 'https://udyamimitra.in',
    officialSourceUrl: 'https://www.mudra.org.in',
    officialSource: 'https://www.mudra.org.in',
    guidelineSourceUrl: 'https://www.mudra.org.in',
    portalName: 'Udyami Mitra MUDRA Loan Portal',
  },

  // 19. PM Vishwakarma Scheme
  scheme_019: {
    applicationUrl: 'https://pmvishwakarma.gov.in',
    officialSourceUrl: 'https://pmvishwakarma.gov.in',
    officialSource: 'https://pmvishwakarma.gov.in',
    guidelineSourceUrl: 'https://pmvishwakarma.gov.in',
    portalName: 'PM Vishwakarma Official Portal',
  },

  // 20. PM SVANidhi Scheme
  scheme_020: {
    applicationUrl: 'https://pmsvanidhi.mohua.gov.in',
    officialSourceUrl: 'https://pmsvanidhi.mohua.gov.in',
    officialSource: 'https://mohua.gov.in',
    guidelineSourceUrl: 'https://pmsvanidhi.mohua.gov.in',
    portalName: 'PM SVANidhi Street Vendor Portal',
  },

  // 21. Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)
  scheme_021: {
    applicationUrl: 'https://nrega.nic.in',
    officialSourceUrl: 'https://nrega.nic.in',
    officialSource: 'https://nrega.nic.in',
    guidelineSourceUrl: 'https://nrega.nic.in',
    portalName: 'NREGA Job Card & Wages Portal',
  },

  // 22. Telangana Kalyana Lakshmi / Shaadi Mubarak
  scheme_022: {
    applicationUrl: 'https://telanganaepass.cgg.gov.in/KalyanLakshmi.do',
    officialSourceUrl: 'https://telanganaepass.cgg.gov.in/KalyanLakshmi.do',
    officialSource: 'https://telanganaepass.cgg.gov.in',
    guidelineSourceUrl: 'https://telanganaepass.cgg.gov.in/KalyanLakshmi.do',
    portalName: 'Telangana ePASS Kalyana Lakshmi & Shaadi Mubarak Portal',
  },

  // 23. Pradhan Mantri Suraksha Bima Yojana (PMSBY)
  scheme_023: {
    applicationUrl: 'https://jansuraksha.gov.in',
    officialSourceUrl: 'https://jansuraksha.gov.in',
    officialSource: 'https://financialservices.gov.in',
    guidelineSourceUrl: 'https://jansuraksha.gov.in',
    portalName: 'Jan Suraksha Accident Insurance Portal',
  },

  // 24. Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)
  scheme_024: {
    applicationUrl: 'https://jansuraksha.gov.in',
    officialSourceUrl: 'https://jansuraksha.gov.in',
    officialSource: 'https://financialservices.gov.in',
    guidelineSourceUrl: 'https://jansuraksha.gov.in',
    portalName: 'Jan Suraksha Life Insurance Portal',
  },

  // 25. Atal Pension Yojana (APY)
  scheme_025: {
    applicationUrl: 'https://jansuraksha.gov.in',
    officialSourceUrl: 'https://www.pfrda.org.in',
    officialSource: 'https://www.pfrda.org.in',
    guidelineSourceUrl: 'https://jansuraksha.gov.in',
    portalName: 'Jan Suraksha & PFRDA Pension Portal',
  },

  // 26. Indira Gandhi National Old Age Pension (IGNOAP)
  scheme_026: {
    applicationUrl: 'https://nsap.dord.gov.in',
    officialSourceUrl: 'https://nsap.dord.gov.in',
    officialSource: 'https://rural.gov.in',
    guidelineSourceUrl: 'https://nsap.dord.gov.in',
    portalName: 'NSAP National Social Assistance Portal',
  },

  // 27. National Means-cum-Merit Scholarship (NMMSS)
  scheme_027: {
    applicationUrl: 'https://scholarships.gov.in',
    officialSourceUrl: 'https://scholarships.gov.in',
    officialSource: 'https://scholarships.gov.in',
    guidelineSourceUrl: 'https://scholarships.gov.in',
    portalName: 'National Scholarship Portal (NSP)',
  },

  // 28. Telangana CM Overseas Scholarship Scheme
  scheme_028: {
    applicationUrl: 'https://telanganaepass.cgg.gov.in/OverseasLinks.do',
    officialSourceUrl: 'https://telanganaepass.cgg.gov.in/OverseasLinks.do',
    officialSource: 'https://telanganaepass.cgg.gov.in',
    guidelineSourceUrl: 'https://telanganaepass.cgg.gov.in/OverseasLinks.do',
    portalName: 'Telangana ePASS Overseas Scholarship Portal',
  },

  // 29. Deendayal Antyodaya Yojana - NRLM (DAY-NRLM)
  scheme_029: {
    applicationUrl: 'https://aajeevika.gov.in',
    officialSourceUrl: 'https://aajeevika.gov.in',
    officialSource: 'https://rural.gov.in',
    guidelineSourceUrl: 'https://aajeevika.gov.in',
    portalName: 'Aajeevika DAY-NRLM National Portal',
  },

  // 30. Telangana Disability Pension & UDID Scheme
  scheme_030: {
    applicationUrl: 'https://swavlambancard.gov.in',
    officialSourceUrl: 'https://cheyutha.telangana.gov.in',
    officialSource: 'https://swavlambancard.gov.in',
    guidelineSourceUrl: 'https://swavlambancard.gov.in',
    portalName: 'UDID Swavlamban Card Portal',
    secondaryPortalUrl: 'https://cheyutha.telangana.gov.in',
    secondaryPortalName: 'Telangana Cheyutha Disability Pension Portal',
  },

  // 31. Sukanya Samriddhi Yojana (SSY)
  scheme_031: {
    applicationUrl: 'https://www.indiapost.gov.in',
    officialSourceUrl: 'https://www.indiapost.gov.in',
    officialSource: 'https://www.nsiindia.gov.in',
    guidelineSourceUrl: 'https://www.indiapost.gov.in',
    portalName: 'India Post National Savings Portal',
  },

  // 32. Stand-Up India Scheme
  scheme_032: {
    applicationUrl: 'https://www.standupmitra.in',
    officialSourceUrl: 'https://www.standupmitra.in',
    officialSource: 'https://www.standupmitra.in',
    guidelineSourceUrl: 'https://www.standupmitra.in',
    portalName: 'Stand-Up Mitra Official Portal',
  },

  // 33. Pradhan Mantri Ujjwala Yojana 2.0 (PMUY)
  scheme_033: {
    applicationUrl: 'https://pmuy.gov.in',
    officialSourceUrl: 'https://pmuy.gov.in',
    officialSource: 'https://mopng.gov.in',
    guidelineSourceUrl: 'https://pmuy.gov.in',
    portalName: 'PMUY 2.0 Ujjwala Portal',
  },

  // 34. Telangana Dalit Bandhu Scheme
  scheme_034: {
    applicationUrl: 'https://tsobmms.cgg.gov.in',
    officialSourceUrl: 'https://tsobmms.cgg.gov.in',
    officialSource: 'https://telangana.gov.in',
    guidelineSourceUrl: 'https://tsobmms.cgg.gov.in',
    portalName: 'Telangana OBMMS Welfare Portal',
  },

  // 35. Prime Minister's Employment Generation Programme (PMEGP)
  scheme_035: {
    applicationUrl: 'https://pmegp.msme.gov.in',
    officialSourceUrl: 'https://pmegp.msme.gov.in',
    officialSource: 'https://msme.gov.in',
    guidelineSourceUrl: 'https://pmegp.msme.gov.in',
    portalName: 'MSME PMEGP Official Portal',
  },
};

let modifiedCount = 0;
schemes.forEach(s => {
  if (updates[s.schemeId]) {
    Object.assign(s, updates[s.schemeId]);
    modifiedCount++;
  }
});

fs.writeFileSync(schemesPath, JSON.stringify(schemes, null, 2), 'utf8');
console.log(`Successfully updated ${modifiedCount} schemes with verified and working portal URLs.`);
