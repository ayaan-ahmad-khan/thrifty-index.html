// ===== SEVABRIDGE NGO APP DATA =====

const DB = {
  locations: [
    {id:1,name:"Yelahanka Slum Cluster",area:"Yelahanka",needs:["Food","Shelter"],urgency:"urgent",people:42,x:155,y:38,icon:"🏚",assigned:"Savitha Nair",desc:"Large cluster of temporary shelters. Families displaced from construction site. Critical food shortage.",contact:"9844123456"},
    {id:2,name:"KR Puram Railway Colony",area:"KR Puram",needs:["Medical","Food"],urgency:"urgent",people:31,x:262,y:118,icon:"🏠",assigned:"Mohan Raju",desc:"Railway workers colony. 8 children with fever, adult hypertension cases. Monthly food support needed.",contact:"9880234567"},
    {id:3,name:"Rajajinagar Footpath Community",area:"Rajajinagar",needs:["Food"],urgency:"moderate",people:18,x:72,y:108,icon:"🏕",assigned:"Unassigned",desc:"Footpath dwellers near the bus stand. Daily meals support needed.",contact:"9740345678"},
    {id:4,name:"BTM Layout Migrant Camp",area:"BTM Layout",needs:["Shelter","Food"],urgency:"moderate",people:55,x:147,y:198,icon:"⛺",assigned:"Ananya Krishnan",desc:"Seasonal migrants from Tamil Nadu. Temporary tarpaulin shelters, need permanent housing support.",contact:"8971456789"},
    {id:5,name:"Whitefield Labour Colony",area:"Whitefield",needs:["Medical"],urgency:"moderate",people:27,x:332,y:126,icon:"🏗",assigned:"Unassigned",desc:"Construction labourers. No access to healthcare. Skin conditions and injuries.",contact:"9632567890"},
    {id:6,name:"Koramangala Elderly Home",area:"Koramangala",needs:["Medical","Food"],urgency:"assisted",people:14,x:237,y:198,icon:"🏥",assigned:"Lakshmi B.",desc:"Abandoned elderly individuals. Regular medical checkups and daily meals being provided.",contact:"9845678901"},
    {id:7,name:"Hebbal Street Children",area:"Hebbal",needs:["Food","Education"],urgency:"urgent",people:22,x:224,y:42,icon:"🏫",assigned:"Ananya Krishnan",desc:"Children living near Hebbal flyover. Need nutrition, schooling support and safety.",contact:"9776789012"},
    {id:8,name:"Yeshwanthpur Squatters",area:"Yeshwanthpur",needs:["Shelter"],urgency:"assisted",people:19,x:57,y:62,icon:"🏘",assigned:"Deepak S.",desc:"Families under the overbridge. Being relocated to government housing. Ongoing support.",contact:"9742890123"},
  ],

  donors: [
    {id:1,name:"Ramesh Infrastructure Pvt Ltd",short:"Ramesh Infra",type:"corporate",avatar:"RI",color:"#3A6FA8",donated:80000,goal:100000,phone:"080-41234567",email:"csr@rameshinfra.com",since:"Jan 2023",items:["Food kits","Tarpaulins"],lastDonation:"Apr 18"},
    {id:2,name:"Priya Venkatesh",short:"Priya V",type:"individual",avatar:"PV",color:"#3E7B52",donated:15000,goal:20000,phone:"9845001234",email:"priya.v@gmail.com",since:"Mar 2024",items:["Medical supplies"],lastDonation:"Apr 25"},
    {id:3,name:"Jayadev Charitable Foundation",short:"Jayadev Fdn",type:"trust",avatar:"JF",color:"#C97C35",donated:60000,goal:150000,phone:"080-33221100",email:"grants@jayadevfdn.org",since:"Aug 2022",items:["Food","Education kits","Medicines"],lastDonation:"Apr 10"},
    {id:4,name:"Kavitha Sharma",short:"Kavitha S",type:"individual",avatar:"KS",color:"#3B8C7A",donated:8000,goal:10000,phone:"9900112233",email:"kavitha.s@yahoo.com",since:"Nov 2023",items:["Clothes","Food"],lastDonation:"Apr 22"},
    {id:5,name:"MG Road Traders Association",short:"MGRTA",type:"corporate",avatar:"MT",color:"#7B5EA7",donated:45000,goal:80000,phone:"9980223344",email:"info@mgrtabang.com",since:"Feb 2023",items:["Food kits","Blankets"],lastDonation:"Apr 5"},
  ],

  staff: [
    {id:1,name:"Ananya Krishnan",role:"Field Coordinator",zone:"BTM Layout / Hebbal",active:true,avatar:"AK",color:"#3E7B52",phone:"9844100001",task:"Food distribution",since:"Jan 2022",cases:34},
    {id:2,name:"Mohan Raju",role:"Medical Officer",zone:"KR Puram",active:true,avatar:"MR",color:"#3A6FA8",phone:"9844100002",task:"Health checkup camp",since:"Mar 2022",cases:28},
    {id:3,name:"Savitha Nair",role:"Social Worker",zone:"Yelahanka",active:true,avatar:"SN",color:"#3B8C7A",phone:"9844100003",task:"Family registration",since:"Jun 2022",cases:41},
    {id:4,name:"Deepak S.",role:"Driver / Logistics",zone:"Yeshwanthpur",active:false,avatar:"DS",color:"#C97C35",phone:"9844100004",task:"Scheduled 2 PM run",since:"Sep 2022",cases:0},
    {id:5,name:"Lakshmi B.",role:"Volunteer Lead",zone:"Koramangala",active:true,avatar:"LB",color:"#8A5BA8",phone:"9844100005",task:"Elderly care visit",since:"Dec 2022",cases:19},
    {id:6,name:"Ravi Kumar",role:"Community Outreach",zone:"Rajajinagar",active:true,avatar:"RK",color:"#A8355B",phone:"9844100006",task:"New family survey",since:"Feb 2023",cases:22},
    {id:7,name:"Meena Pillai",role:"Education Officer",zone:"Hebbal",active:false,avatar:"MP",color:"#5B7BA8",phone:"9844100007",task:"On leave",since:"Apr 2023",cases:15},
  ],

  alerts: [
    {id:1,time:"10:32 AM",msg:"42 families in Yelahanka need emergency food packets urgently. Stock running low.",type:"urgent",read:false},
    {id:2,time:"10:08 AM",msg:"₹25,000 donation received from Ramesh Infrastructure for food kits.",type:"donation",read:false},
    {id:3,time:"9:12 AM",msg:"KR Puram: 8 children showing fever symptoms. Medical officer dispatched.",type:"urgent",read:false},
    {id:4,time:"8:45 AM",msg:"Mohan Raju checked in at KR Puram health camp. 31 beneficiaries today.",type:"info",read:true},
    {id:5,time:"Yesterday",msg:"Koramangala elderly care distribution complete. 14 individuals assisted.",type:"success",read:true},
    {id:6,time:"Yesterday",msg:"New staff Lakshmi B. onboarded. Assigned to Koramangala zone.",type:"info",read:true},
    {id:7,time:"Yesterday",msg:"Jayadev Foundation pledged ₹60,000 towards the quarterly food drive.",type:"donation",read:true},
    {id:8,time:"2 days ago",msg:"Whitefield: 5 new families registered. Needs assessment completed.",type:"info",read:true},
  ],

  weeklyStats: [
    {day:"Mon",count:32},{day:"Tue",count:45},{day:"Wed",count:38},{day:"Thu",count:61},{day:"Fri",count:53},{day:"Sat",count:70},{day:"Sun",count:42}
  ],

  donationCategories: [
    {label:"Food",pct:45,color:"#3E7B52"},
    {label:"Medical",pct:25,color:"#3A6FA8"},
    {label:"Shelter",pct:20,color:"#C97C35"},
    {label:"Education",pct:10,color:"#8A5BA8"},
  ]
};

// LocalStorage helpers
function saveDB(){localStorage.setItem('sevabridge_db',JSON.stringify(DB))}
function loadDB(){
  const saved = localStorage.getItem('sevabridge_db');
  if(saved){const d=JSON.parse(saved);Object.assign(DB,d)}
}
loadDB();
