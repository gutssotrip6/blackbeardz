// Algerian Wilayas and Cities Data
export interface WilayaData {
  name: string;
  cities: string[];
}

export const wilayasData: WilayaData[] = [
  {
    name: "Adrar",
    cities: ["Adrar", "Tamest", "Reggane", "Inzghmir", "Tit", "Tsabit", "Zaouiet Kounta", "Aoulef", "Tamekten", "Tamantit", "Fenoughil", "Sali", "Akabli", "Ouled Ahmed Tammi", "Bouda", "Sebaa"]
  },
  {
    name: "Chlef",
    cities: ["Chlef", "Ténès", "Oued Fodda", "Abou El Hassan", "Aïn Merane", "Talassa", "El Marsa", "Bénairia", "Ouled Fares", "Harchoun", "Zeboudja", "Sendjas", "Oued Sly", "Oued Goussine", "Taougrite", "Labiod Medjadja", "Dahra", "El Hadjadj", "Moussadek", "Breira", "Sidi Akkacha", "Beni Haoua", "Chettia", "Ouled Ben Abdelkader", "Ouled Abbes", "Beni Rached", "Oum Drou", "Tadjena", "Sobha", "Zebabdja", "Sidi Abderrahmane", "Harenfa", "Boukadir", "Bouzeghaia", "El Karimia"]
  },
  {
    name: "Laghouat",
    cities: ["Laghouat", "Aïn Mahdi", "Ksar El Hirane", "Hassi R'Mel", "Hassi Delaa", "Sidi Makhlouf", "Gueltat Sidi Saad", "El Ghicha", "Brida", "Tadjemout", "Tadjrouna", "Hadj Mechnane", "El Haouaita", "Kheneg", "Oued Morra", "Sidi Bouzid", "Beidha", "El Assafia", "Sebgag", "Oued Touil", "Taouiala", "Bennaceur", "Oued M'zi", "El Houaita"]
  },
  {
    name: "Oum El Bouaghi",
    cities: ["Oum El Bouaghi", "Aïn Beïda", "Aïn Fakroun", "Souk Naamane", "Meskiana", "Aïn Kercha", "Fkirina", "Bir Chouhada", "Rahia", "Aïn Diss", "Aïn Babouche", "Dhalaa", "Aïn Zitoun", "El Amiria", "El Fedjoudj Boughrara Saoudi", "Ksar Sbahi", "Hanchir Toumghani", "Ouled Gacem", "Zorg", "Behir Chergui", "Sigus", "Aïn Regada", "El Belailia", "Ouled Zouai", "Ain Kercha", "Aïn M'lila"]
  },
  {
    name: "Batna",
    cities: ["Batna", "Aïn Touta", "Arris", "Timgad", "N'Gaous", "Tazoult", "Menaa", "Djezzar", "El Madher", "Seriana", "Bouzina", "Ichmoul", "Boumagueur", "Ouyoun El Assafir", "Oued Chaaba", "Aïn Djasser", "Aïn Yagout", "Fesdis", "Hidoussa", "Theniet El Abed", "T'Kout", "Ouled Si Slimane", "Bitam", "Ghassira", "Kimmel", "Maafa", "Zoui", "Ras El Aioun", "Ksar Bellezma", "Lemsane", "Seggana", "Oued El Ma", "Boulhilat", "Foum Toub", "Rahbat", "El Hassi", "El Hamma", "Ouled Ammar", "Guigba", "Taxlent", "Boumia", "Aïn Zaatout", "Larbaâ", "Chir", "Tigherghar", "Djerma", "Tilatou", "Gosbat", "Lazrou", "Ben Foudhala El Hakania", "Talkhamt", "Ouled Aouf", "Ouled Fadel", "Oued Taga", "Chemora", "Merouana", "Abdelkader Azil", "Inoughissen", "Nara", "M'Doukal", "Sefiane"]
  },
  {
    name: "Béjaïa",
    cities: ["Béjaïa", "Amizour", "Béni Maouche", "Aokas", "Tazmalt", "Akbou", "Amalou", "Chellata", "Seddouk", "Ighil Ali", "Tifra", "Darguina", "Souk Oufella", "Adekar", "El Kseur", "Melbou", "Oued Ghir", "Beni Ksila", "Kherrata", "Timezrit", "Feraoun", "Boudjellil", "Tichy", "Tala Hamza", "Toudja", "Beni Djellil", "Kendira", "Beni Mellikèche", "Taskriout", "Ouzellaguèn", "Leflaye", "Aït Smail", "Beni R'Zine", "Fenaia Ilmaten", "Souk El Tenine", "Sidi Aïch", "Chelata", "Ighram", "Aïn Zaouia", "Tazira", "Thinabther", "Bouhamza", "Ifri Ouzellaguen", "Tibane", "Aït Rzine", "Tamokra", "Beni Mehlikel", "Boudjelil"]
  },
  {
    name: "Biskra",
    cities: ["Biskra", "Chetma", "Sidi Okba", "Tolga", "Foughala", "Lioua", "Ourlal", "Mchouneche", "Aïn Naga", "Zeribet El Oued", "Bordj Ben Azzouz", "M'Lili", "Lichana", "El Feidh", "Branis", "El Haouch", "Besbes", "Meziraa", "Chaiba", "Oumache", "Aïn Skhouna", "Doucen", "El Kantara", "Aïn Ben Noui", "Bouchagroun", "Djemorah", "El Outaya", "Fontaine Des Gazelles", "Leghrous", "Mekhadma", "Sidi Khaled", "Ras El Miaad"]
  },
  {
    name: "Béchar",
    cities: ["Béchar", "Kenadsa", "Meridja", "Abadla", "Lahmar", "Timoudi", "Igli", "Mechraa Houari Boumediene", "Ksabi", "Tamtert", "El Ouata", "Mogheul", "Taghit", "Beni Abbès", "Kerzaz", "Ouled Khoudir", "Ougarta", "Beni Ikhlef"]
  },
  {
    name: "Blida",
    cities: ["Blida", "Boufarik", "Ouled Yaich", "Mouzaia", "Bougara", "Bouinan", "Chebli", "Meftah", "Chiffa", "Guerrouaou", "Chréa", "Larbaa", "Ouled Selama", "Ben Khellil", "Hammam Melouane", "Soumaa", "Aïn Romana", "Bouarfa", "Djebabra", "El Affroun", "Oued Djer", "Oued El Alleug", "Beni Mered", "Ben Tamou", "Beni Tamou", "Souhane"]
  },
  {
    name: "Bouira",
    cities: ["Bouira", "Aïn Bessem", "El Asnam", "Chorfa", "M'Chedallah", "Sour El Ghouzlane", "Lakhdaria", "El Hachimia", "Haïzer", "Kadiria", "Bir Ghbalou", "Ridane", "Aïn Laloui", "Aomar", "Dirah", "Aghbalou", "Aïn El Hadjar", "Bechloul", "Bouderbala", "El Adjiba", "Guerrouma", "Hanif", "Maâla", "Ouled Rached", "Zbarbar", "Saharidj", "Dechmia", "Bordj Okhriss", "Taguedit", "Taghzout", "Aït Laaziz", "Ahl El Ksar", "Raouraoua", "Boukram", "Hadjera Zerga", "Aïn Turk", "El Esnam", "Mezdour", "Oued El Berdi", "Rebaïa", "Taouri Willaya", "Aïn El Berda"]
  },
  {
    name: "Tamanrasset",
    cities: ["Tamanrasset", "Abalessa", "Idèles", "Tazrouk", "Iherir"]
  },
  {
    name: "Tébessa",
    cities: ["Tébessa", "El Aouinet", "Ouenza", "Cheria", "Aïn Zerga", "Morsott", "El Ogla", "Bir Dheheb", "Stah Guentis", "Hammamet", "El Kouif", "Bekkaria", "Oum Ali", "Boukhadra", "El Ma Labiod", "Ferkane", "Negrine", "Bir El Ater", "Safsaf El Oussara", "Thlidjène", "Aïn El Karma", "El Houidjbet", "Gouriguer", "Bir Mokadem", "Tlidjene", "El Meridj", "Ouled Moumen"]
  },
  {
    name: "Tlemcen",
    cities: ["Tlemcen", "Mansourah", "Hennaya", "Maghnia", "Ghazaouet", "Nedroma", "Sabra", "Remchi", "Aïn Tallout", "Bab El Assa", "Dar Yaghmoracen", "El Fehoul", "Fellaoucene", "Hammam Boughrara", "Honaine", "Marsa Ben M'Hidi", "Msirda Fouaga", "Ouled Mimoun", "Sebdou", "Sidi Abdelli", "Souahlia", "Tienet", "Zenata", "Sidi Djillali", "Beni Boussaid", "Beni Snous", "Bensekrane", "Chetouane", "El Bouihi", "Aïn Fezza", "Aïn Ghoraba", "Aïn Youcef", "Azail", "Beni Bahdel", "El Gor", "Helouane", "Imama", "Ouled Riyah", "Sebbah", "Sidi Medjahed", "Souk Tleta", "El Aricha", "Aïn Kebira", "Beni Ouarsous", "Bouihi", "Henaya"]
  },
  {
    name: "Tiaret",
    cities: ["Tiaret", "Aïn Bouchekif", "Sidi Bakhti", "Medrissa", "Aïn Dzarit", "Guertoufa", "Sidi Ali Mellal", "Nadorah", "Aïn El Hadid", "Mahdia", "Sougueur", "Sidi Hosni", "Dahmouni", "Aïn Kermes", "Madna", "Aïn Deheb", "Rahouia", "Maamoura", "Sebaïne", "Serghine", "Naima", "Mechraa Safa", "Zmalet El Emir Abdelkader", "Oued Lilli", "Tagdempt", "Tousnina", "Frenda", "Aïn El Abd", "Ferdjoua", "Djebilet Rosfa", "Hamadia", "Chehaida", "Sidi Abderrahmane", "Bougara", "Sidi M'Hamed Ben Aouda", "Oued El Lili", "Takhemaret", "Ain Dheb", "Rechaiga", "Rosfa", "Si Abdelghani"]
  },
  {
    name: "Tizi Ouzou",
    cities: ["Tizi Ouzou", "Aïn El Hammam", "Azazga", "Béni Douala", "Draa Ben Khedda", "Draa El Mizan", "Iferhounène", "Larbaâ Nath Irathen", "Maâtkas", "Mekla", "Ouadhia", "Ouaguenoun", "Tigzirt", "Timizart", "Tizi Gheniff", "Tizi N'Tleta", "Bouzeguène", "Aït Yahia Moussa", "Aït Mahmoud", "Frikat", "Iboudraren", "Iflissen", "Illoula Oumalou", "Irdjen", "Makouda", "Mizrana", "Souk El Tnine Aït Aïssa Mimoun", "Tala Aït Yahia", "Tirmitine", "Yakouren", "Yatafen", "Aghribs", "Agouni Gueghrane", "Aït Aggouacha", "Aït Aïssa Mimoun", "Aït Bouaddou", "Aït Boumahdi", "Aït Chafaa", "Aït Khelil", "Aït Oumalou", "Aït R'Zine", "Aït Toudert", "Aït Yahia", "Akerrou", "Aïn Zaouia", "Assi Youcef", "Azeffoun", "Béni Aïssi", "Béni Yenni", "Zekri", "Beni Zikki", "Boghni", "Ifigha", "Imesbah", "Imsouhal", "Mkira", "Oued Aissi", "Sidi Naâmane", "Tizi Rached", "Aït Khellili", "Beni Aissi", "M'Kira", "Souk El Had"]
  },
  {
    name: "Alger",
    cities: ["Alger-Centre", "Sidi M'Hamed", "El Madania", "Belouizdad", "Bab El Oued", "Bologhine Ibn Ziri", "Casbah", "Oued Koriche", "Bir Mourad Raïs", "El Biar", "Bouzaréah", "Birkhadem", "El Harrach", "Baraki", "Oued Smar", "Bachdjerrah", "Hussein Dey", "Kouba", "Bourouba", "Dar El Beïda", "Bab Ezzouar", "Ben Aknoun", "Dely Ibrahim", "Hammamet", "Raïs Hamidou", "Djasr Kasentina", "El Magharia", "Beni Messous", "Les Eucalyptus", "Birtouta", "Tessala El Merdja", "Douéra", "Souidania", "Chéraga", "Staouéli", "Zeralda", "Mahelma", "Rahmania", "Ouled Chebel", "Sidi Moussa", "Aïn Taya", "Bordj El Bahri", "El Marsa", "H'Raoua", "Rouiba", "Réghaïa", "Aïn Benian", "Saoula", "El Achour", "Khraicia", "Ouled Fayet", "El Mouradia", "Hydra", "Draria", "Mohammadia"]
  },
  {
    name: "Djelfa",
    cities: ["Djelfa", "Moudjbara", "El Guedid", "Hassi Bahbah", "Aïn Maabed", "Sed Rahal", "Faidh El Botma", "Birine", "Bouira Lahdab", "Zaccar", "El Khemis", "Sidi Baizid", "Mliliha", "El Houaita", "Taadmit", "Guernini", "Selmana", "Aïn Chouhada", "El Idrissia", "Douis", "Had Sahary", "Guettara", "Charef", "Benhar", "Hassi El Euch", "Amourah", "Dar Chioukh", "Deldoul", "El Kseur", "Zacar", "Oum Laadham", "Hassi Fehal", "Messaad", "Aïn Oussera", "El Abiodh"]
  },
  {
    name: "Jijel",
    cities: ["Jijel", "El Milia", "Taher", "Chekfa", "Erraguene", "El Aouana", "Ziama Mansouriah", "Texenna", "Djimla", "Selma Benziada", "Kaous", "Boucif Ouled Askeur", "Bordj T'Har", "Sidi Maarouf", "Emir Abdelkader", "Ouled Yahia Khedrouche", "Settara", "El Kennar Nouchfi", "Ouled Rabah", "Ghebala", "Bouraoui Belhadef", "Chahna", "Oudjana", "Sidi Abdelaziz", "Dj'Bel", "El Djemaa Beni Habibi", "Les Genêts", "Kheïri Oued Adjoul"]
  },
  {
    name: "Sétif",
    cities: ["Sétif", "Aïn El Kebira", "Aïn Arnat", "Aïn Azel", "Aïn Lahdjar", "Aïn Legraj", "Aïn Oulmene", "Aïn Roua", "Aïn Sebt", "Aïn Abessa", "Aït Naoual Mezada", "Aït Tizi", "Amoucha", "Babor", "Bazer Sakhra", "Beidha Bordj", "Bellaa", "Beni Aziz", "Beni Chebana", "Beni Fouda", "Beni Hocine", "Beni Mouhli", "Bir El Arch", "Bir Haddada", "Bouandas", "Bougaa", "Boutaleb", "Dehamcha", "Djemila", "El Eulma", "El Ouricia", "El Mehir", "Guidjel", "Guellal", "Guenzet", "Hammam Guergour", "Hammam Sokhna", "Hamma", "Ksar El Abtal", "Maaouia", "Maouane", "Mezloug", "Oued El Bared", "Ouled Addouane", "Ouled Sabor", "Ouled Si Ahmed", "Ouled Tebben", "Rasdaïa", "Salah Bey", "Tachouda", "Talaifacene", "Taya", "Tizi N'Bechar", "Zit El Aat", "Aïn Kebira", "Ain Oulmene", "Ain Azel"]
  },
  {
    name: "Saïda",
    cities: ["Saïda", "Aïn El Hadjar", "Ouled Brahim", "Maamora", "Youb", "Tircine", "Doui Thabet", "Aïn Soltane", "Aïn Sekhouna", "Hounet", "Sidi Ahmed", "Sidi Boubekeur", "Moulay Larbi", "El Hassasna", "Rebahia"]
  },
  {
    name: "Skikda",
    cities: ["Skikda", "El Hadaïek", "Aïn Bouziane", "Ramdane Djamel", "Hamadi Krouma", "Oum Toub", "Tamalous", "Djendel Saadi Mohamed", "Kerkera", "Beni Bechir", "Salah Bouchaour", "Emdjez Edchich", "Zitouna", "Béni Zid", "Fil Fila", "Aïn Charchar", "Collo", "Ouled Attia", "Ouled Zouai", "Sidi Mezghiche", "Ben Azzouz", "El Harrouch", "Zerdazah", "Aïn Zouit", "Oued Zehour", "Saf Saf", "Bouchtata", "Aïn Kechra", "Cheraia", "Beni Oulbane", "Khezaras", "Beni Bekker", "Oued El Houl", "Oued Sfa", "Roknia", "Boulma", "Esseboua", "Djendel Saadi Mohammed"]
  },
  {
    name: "Sidi Bel Abbès",
    cities: ["Sidi Bel Abbès", "Tessala", "Tilmouni", "Redjem Demouche", "Mezaourou", "Marhoum", "Aïn Thrid", "Bir El Hammam", "Sidi Chaïb", "Belarbi", "Sidi Hamadouche", "Tabia", "Sidi Khaled", "Ben Badis", "Aïn El Berd", "Aïn Kada", "Lamtar", "Sidi Lahcene", "Oued Sebaa", "Dhaya", "Merine", "El Hacaïba", "Guelta Zerqa", "Zehamra", "Sidi Ali Benyoub", "Ras El Ma", "Tenira", "Mostefa Ben Brahim", "Aïn Tindamine", "Balloul", "Benachiba Chelia", "Boudjebaa El Bordj", "Chetouane", "El Haçaiba", "Hassi Dahou", "Hassi Zahana", "Maketalane", "Moulay Slissen", "M'Rija", "Oued Taourira", "Sehala Thaoura", "Sidi Brahim", "Sidi Chaib", "Sidi Yakoub", "Souakria", "Zerouala"]
  },
  {
    name: "Annaba",
    cities: ["Annaba", "El Bouni", "El Hadjar", "Aïn Berda", "Berrahal", "Chetaïbi", "Eulma", "Seraïdi", "Cheurfa", "Treat", "Sidi Amar", "Oued El Aneb"]
  },
  {
    name: "Guelma",
    cities: ["Guelma", "Bouchegouf", "Héliopolis", "Oued Zenati", "Aïn Makhlouf", "Aïn Ben Beida", "Tamlouka", "Djeballah Khemissi", "Houari Boumediene", "Medjez Ammar", "Medjez Sfa", "Belkhir", "Bou Hamdane", "Aïn Larbi", "Khezara", "Dahouara", "Hammam Debagh", "Hammam N'Baïl", "Ben Djerrah", "Nechmeya", "Sellaoua Announa", "El Fedjoudj", "Roknia", "Bouati Mahmoud", "Oued Fragha", "Ras El Agba", "Aïn Sandel", "Belair", "Bordj Sabat", "Boumahra Ahmed", "Guelaat Bou Sbaa", "Heliopolis"]
  },
  {
    name: "Constantine",
    cities: ["Constantine", "El Khroub", "Aïn Smara", "Didouche Mourad", "Hamma Bouziane", "Zighoud Youcef", "Ibn Ziad", "Ouled Rahmoune", "Beni Hamiden", "Messaoud Boudjeriou", "Aïn Abid", "Beni Hamidene"]
  },
  {
    name: "Médéa",
    cities: ["Médéa", "Berrouaghia", "Aïn Boucif", "El Aissaouia", "Ouled Deïd", "Saneg", "Tablat", "Ouzera", "Aïn Ouksir", "Ben Chicao", "El Omaria", "Beni Slimane", "Sidi Naâmane", "Aïn Oussera", "Derrag", "El Hamdania", "Ouamri", "Si Mahdjoub", "Seghouane", "Chahbounia", "Meghraoua", "Aissaouia", "Rebaia", "Bouaïche", "Bouskene", "Sedraia", "Aziz", "Chellalet El Adhaoura", "Bir Ben Laabed", "Sidi Damed", "Tafraout", "Aïn Fares", "Kef Lakhdar", "Boghar", "Meftaha", "Bouchrahil", "Rahel", "Baata", "El Guedid", "El Azizia", "Sidi Zahar", "Souaghi", "Ouled Maaref", "Maoucif", "El Titteri", "Draa Essamar", "Tourzout", "Beni Mérad", "Oued Harbil", "Sidi El Abbes", "Ouled Deide", "Zoubiria", "Ksar El Boukhari", "Benchicao", "Ain Ouksir"]
  },
  {
    name: "Mostaganem",
    cities: ["Mostaganem", "Sidi Ali", "Aïn Nouissi", "Mazagran", "Aïn Boudinar", "Stidia", "Fornaka", "Mesra", "Sour", "Bouguirat", "Oued El Kheir", "Sayada", "Mansourah", "Touahria", "Hadjadj", "Ouled Maallah", "Acharaïne", "Souaflia", "Abdelmalek Ramdane", "Sirat", "Sidi Belattar", "Oued Sly", "El Hassiane", "Aïn Sidi Cherif", "Benabdelmalek Ramdane", "Aïn Tédeles", "Sidi Lakhdar", "Tazmalet", "Achaacha", "Kheïr Eddine", "Ain Nouissi", "Metabia"]
  },
  {
    name: "M'Sila",
    cities: ["M'Sila", "Aïn El Melh", "Hammam Dalaa", "Sidi Aïssa", "Bou Saâda", "Bir Foda", "Ben Srour", "Chellal", "El Hamel", "Bouti Sayah", "El Houamed", "Khoubana", "Sidi Ameur", "Berhoum", "Aïn El Hadjel", "Souamaa", "Tamsa", "Dehahna", "Khettouti Sed El Djir", "Ouled Derradj", "Beni Ilmane", "Djebel Messaad", "Maarif", "Oued Chaïr", "Magra", "Aïn El Khadra", "Oultene", "Aïn Rich", "El Burg", "Sidi M'Hamed", "Douar El Ma", "M'Tarfa", "Ouled Slimane", "Tarmount", "Ouled Mansour", "Beni Ziad", "Benzouh", "Sidi Hadjeres", "Bou Kleïfa", "Medjedel", "Sidi Aissa", "Ain El Melh", "Mcif", "Ksar El Hirane"]
  },
  {
    name: "Mascara",
    cities: ["Mascara", "Aïn Fekan", "Bouhanifia", "Hachem", "El Keurt", "Maoussa", "Tizi", "Oggaz", "Ghomri", "Matemore", "El Gaada", "Khalouia", "Mocta Douz", "Aïn Farès", "Nesmoth", "Oued El Abtal", "El Bordj", "Sidi Kada", "Sidi Abdeldjebbar", "Froha", "Zahana", "Ras El Aïn Amirouche", "Ghriss", "Sig", "Tiguenif", "Beniane", "El Beut", "Sedjerara", "Aouf", "Bou Hanifia", "El Ghomri", "El Mamounia", "Ferraguig", "Gharrous", "Guerdjoum", "Guettena", "Hacine", "Makdha", "Moctah Douz", "Mohammadia", "Ras El Ain Amirouche", "Sidi Boussaid"]
  },
  {
    name: "Ouargla",
    cities: ["Ouargla", "Rouissat", "Aïn Beïda", "El Hadjira", "Sidi Slimane", "Sidi Khouiled", "Hassi Messaoud", "N'Goussa", "Zaouia El Abidia", "El Borma"]
  },
  {
    name: "Oran",
    cities: ["Oran", "Gdyel", "Aïn El Turck", "Bousfer", "Mers El Kébir", "Aïn Biya", "Es Sénia", "Bir El Djir", "Hassi Bounif", "Hassi Mefsoukh", "El Braya", "Aïn El Kerma", "Tafraoui", "El Karma", "Boutlelis", "Oued Tlélat", "Misserghin", "Sidi Chami", "El Ançor", "Bethioua", "Ben Freha", "Sidi Ben Yabka", "Arzew", "Marsat El Hadjadj", "Boufatis", "Sfizef"]
  },
  {
    name: "El Bayadh",
    cities: ["El Bayadh", "Rogassa", "Aïn El Orak", "Ghassoul", "Boualem", "El Bnoud", "Chellala", "Mehara", "Stitten", "Kef El Ahmar", "Brezina", "El Abiodh Sidi Cheikh", "Arbaouat", "Sidi Tifour", "Kraakda", "Tiout"]
  },
  {
    name: "Illizi",
    cities: ["Illizi", "Djanet", "In Amenas", "Debdeb", "Bordj El Houès", "In Aménass"]
  },
  {
    name: "Bordj Bou Arreridj",
    cities: ["Bordj Bou Arreridj", "El Hamadia", "Ras El Oued", "Aïn Taghrout", "Medjana", "El Achir", "Djaafra", "Khelil", "Tesmart", "Tixter", "Mansourah", "Colla", "Ouled Sidi Ibrahim", "El Main", "Hasnaoua", "Aïn Tesra", "Bir Kasdali", "Rabta", "Zemmouri", "Ouled Brahem", "Ouled Dahmane", "Belimour", "Tafreg", "Taglait", "Aïn Benkhell", "Ridane", "Haraza", "Tefregh", "Teniet En Nasr", "Bordj Zemoura"]
  },
  {
    name: "Boumerdès",
    cities: ["Boumerdès", "Boudouaou", "Ouled Moussa", "Isser", "Khemis El Khechna", "Braïssat", "Naciria", "Baghlia", "Sidi Daoud", "Taourga", "Tidjelabine", "Corso", "Afir", "Ben Choud", "Bouzegza Keddara", "Thénia", "Beni Amrane", "Souk El Had", "Timezrit", "Ammal", "Bordj Ménaïel", "Dellys", "Djinet", "Ouled Heddadj", "Laréa", "Hammedi", "Si Mustapha", "Zemmouri", "El Kharrouba", "Larbatache", "Beni Slimane", "Boudouaou El Bahri"]
  },
  {
    name: "El Tarf",
    cities: ["El Tarf", "Ben Mehidi", "Boutheldja", "Drean", "El Aioun", "Zerizer", "Asfour", "Lac Des Oiseaux", "Chebaita Mokhtar", "Berrihane", "Aïn El Assel", "Bouteldja", "Souarekh", "Raml Souk", "Besbes", "Echatt", "Oum Teboul", "El Kala", "Ain El Assel", "Chbaïta Mokhtar"]
  },
  {
    name: "Tindouf",
    cities: ["Tindouf", "Oum El Assel"]
  },
  {
    name: "Tissemsilt",
    cities: ["Tissemsilt", "Lazharia", "Beni Chaïb", "Bordj Bounaama", "Maalem Hanafi", "Sidi Boutouchent", "Boucaïd", "Khémisti", "Aïn Bessim", "Theniet El Had", "Sidi Lantri", "Ammari", "Youssoufia", "Larbaa", "Melaab", "Ouled Bessem", "Lardjem", "Sidi Abed", "Razoul", "Beni Lahcene", "Khemisti"]
  },
  {
    name: "El Oued",
    cities: ["El Oued", "Robbah", "Oued El Alenda", "Bayadha", "Nakhla", "Guemar", "Kouinine", "Reguiba", "Hamraia", "Taghzout", "Debila", "Sidi Aoun", "Trifaoui", "Magrane", "Beni Guecha", "Ourmas", "Still", "Douar El Maa", "El Ogla El Malha", "Mih Ouansa", "Aïn El Beïda", "Sidi Khellil", "Hassani Abdelkrim", "Djamaa", "El M'Ghair", "Taleb Larbi", "Ben Guecha", "Erg El Beyyed", "El Hadjira"]
  },
  {
    name: "Khenchela",
    cities: ["Khenchela", "Babar", "El Hamma", "Chechar", "M'Sara", "Kais", "Ouled Rechache", "El Mahmal", "Ensigha", "Aïn Touila", "Taouzianat", "Baghaï", "Djellal", "El Oueldja", "Remila"]
  },
  {
    name: "Souk Ahras",
    cities: ["Souk Ahras", "Sedrata", "Merahna", "Heddada", "Taoura", "Aïn Zana", "Aïn Soltane", "Ragouba", "Mechroha", "Bir Bouhouche", "Khedara", "Mdaourouche", "Oued Keberit", "Safel El Ouiden", "Terraguelt", "Dréa", "Ouillen", "Oum El Adhaïm", "Lakhbar", "Ouled Driss", "Tiffech", "Hanancha", "Aïn Abassa", "Rezgui", "Teskout", "Ouled Moumen"]
  },
  {
    name: "Tipaza",
    cities: ["Tipaza", "Koléa", "Cherchell", "Hadjout", "Ahmeur El Aïn", "Bou Ismaïl", "Sidi Ghilès", "Menaceur", "Gouraya", "Damous", "Larhat", "Chaïba", "Meurad", "Messelmoune", "Bouharoun", "Aïn Tagourait", "Beni Milleuk", "El Nador", "Fouka", "Douaouda", "Mahelma", "Sidi Amar", "Bou Haroun", "Attatba", "Sidi Semiane", "Khemisti", "Ain Tagourait", "Nador"]
  },
  {
    name: "Mila",
    cities: ["Mila", "Ferdjioua", "Chelghoum Laïd", "Oued Endja", "Tadjenanet", "El Ayadi Barbes", "Aïn Tine", "Sidi Merouane", "Grarem Gouga", "Benyahia Abderrahmane", "Tiberguent", "Hamala", "Teleghma", "Bouhatem", "Yahia Beni Guecha", "Ouled Khlouf", "Sidi Khelifa", "Rouached", "Amieur", "Chigara", "Ahmed Rachedi", "Oued Athmenia", "Zeghaia", "Tassadane Haddada", "Derradji Bousselah", "Terrai Baïnen", "Oued El Athmania", "Ain Tine", "Chelghoum Laid"]
  },
  {
    name: "Aïn Defla",
    cities: ["Aïn Defla", "El Abadia", "Miliana", "Khemis Miliana", "El Attaf", "Hammam Righa", "Zeddine", "Sidi Lakhdar", "Bordj Emir Khaled", "Aïn Lechiekh", "Oued Chorfa", "Djendel", "Rouina", "Aïn Torki", "El Hassania", "Tacheta Zougara", "Tarik Ibn Ziad", "Barbouche", "Ain Benhmida", "Bourached", "El Amra", "Tafraout", "Hoceinia", "Boumedfaa", "Bir Ould Khelifa", "Oued El Djemaa", "Aïn Soltane", "Mekhatria", "Si El Djilali", "Jendel", "Arib"]
  },
  {
    name: "Naâma",
    cities: ["Naâma", "Mecheria", "Aïn Sefra", "Tiout", "Sfissifa", "Moghrar", "Assela", "El Biod", "Mekmen Ben Amar", "Djeniene Bourezg", "Aïn Ben Khelil", "Kasdir"]
  },
  {
    name: "Aïn Témouchent",
    cities: ["Aïn Témouchent", "Hammam Bou Hadjar", "El Amria", "El Malah", "Oulhaca El Gheraba", "Beni Saf", "Aghlal", "Ouled Kihal", "Chaabat El Leham", "Sidi Ben Adda", "Terga", "Hassasna", "Mezaïa", "Aoubellil", "Chentouf", "Tamzoura", "Lahlef", "Sidi Ouriache", "Sidi Safi", "Bouzedjar", "Ain El Arbaâ", "El Emir Abdelkader", "Ain Kihal", "Tounane"]
  },
  {
    name: "Ghardaïa",
    cities: ["Ghardaïa", "Berriane", "Daya Ben Dahoua", "El Guerrara", "Zelfana", "Metlili", "Bounoura", "El Ateuf", "Mansoura", "Sebseb", "Hassi El Fehal", "Dhaya", "El Meniaa"]
  },
  {
    name: "Relizane",
    cities: ["Relizane", "Aïn Tarek", "El Hamadna", "Oued Rhiou", "Sidi M'Hamed Ben Ali", "Mazouna", "Sidi M'Hamed Ben Aouda", "Ramka", "Yellel", "Djidiouia", "El Matmar", "Lahlef", "Beni Dergoun", "Mendes", "Bendaoud", "Sidi Lazreg", "El Hassi", "Ouarizane", "Aïn Rahma", "Sidi Abdelkader", "Mediouna", "Belassel Bouzegza", "Ammi Moussa", "Amirat Aïcha", "Kalaa", "Zahraa", "Had Echkalla", "Oued Essalem", "Aïn El Hamam", "El Guettar", "Hmadna", "Kef Kaf", "Zemmora"]
  },
  {
    name: "Timimoun",
    cities: ["Timimoun", "Ouled Saïd", "Tinerkouk", "Ksar Kaddour", "Charouine", "Ouled Aïssa", "Talmine", "Aougrout"]
  },
  {
    name: "Bordj Badji Mokhtar",
    cities: ["Bordj Badji Mokhtar", "Timiaouine"]
  },
  {
    name: "Ouled Djellal",
    cities: ["Ouled Djellal", "Sidi Khaled", "Ras El Miaad", "Doucen", "El Ghrous", "Chaïba"]
  },
  {
    name: "Béni Abbès",
    cities: ["Béni Abbès", "Kerzaz", "Ouled Khoudir", "Ougarta", "Tamtert", "Timoudi", "Lahmar", "Beni Ikhlef"]
  },
  {
    name: "In Salah",
    cities: ["In Salah", "In Ghar", "Foggaret Ezzaouia"]
  },
  {
    name: "In Guezzam",
    cities: ["In Guezzam", "Tin Zaouatine"]
  },
  {
    name: "Touggourt",
    cities: ["Touggourt", "Témacine", "Blidet Amor", "El Hadjira", "Nezla", "Zaouia El Abidia", "Taibet", "Meguenine", "El Allia"]
  },
  {
    name: "Djanet",
    cities: ["Djanet", "Bordj El Houès"]
  },
  {
    name: "El M'Ghair",
    cities: ["El M'Ghair", "Djamaa", "Still", "Reguiba", "Ourmas", "Megrane", "Sidi Aoun"]
  },
  {
    name: "El Meniaa",
    cities: ["El Meniaa", "Hassi El Gara", "Zelfana", "Bougtob"]
  },
  {
    name: "Aflou",
    cities: ["Aflou", "Gueltat Sidi Saad", "Tadjrouna", "Hadj Mechnane", "Brida", "El Haouaita", "Kheneg", "Bennaceur", "Taouiala", "Oued Morra"]
  },
  {
    name: "Aïn Oussera",
    cities: ["Aïn Oussera", "El Idrissia", "Douis", "Sed Rahal", "Had Sahary", "Guettara", "Hassi El Euch"]
  },
  {
    name: "Barika",
    cities: ["Barika", "Ben Foudhala El Hakania", "Inoughissen", "Boumagueur", "Seggana"]
  },
  {
    name: "Bir el-Ater",
    cities: ["Bir el-Ater", "Bekkaria", "Ferkane", "Negrine", "Safsaf El Oussara"]
  },
  {
    name: "Bou Saâda",
    cities: ["Bou Saâda", "El Hamel", "Khoubana", "Ouled Derradj", "Tamsa", "Oued Chaïr", "Aïn El Khadra"]
  },
  {
    name: "El Abiodh Sidi Cheikh",
    cities: ["El Abiodh Sidi Cheikh", "Arbaouat", "Brezina", "Boualem", "Mehara", "Stitten"]
  },
  {
    name: "El Aricha",
    cities: ["El Aricha", "Aïn Ghoraba", "Sidi Djillali", "Beni Boussaid", "Msirda Fouaga"]
  },
  {
    name: "El Kantara",
    cities: ["El Kantara", "Mchouneche", "Branis", "Aïn Skhouna"]
  },
  {
    name: "Ksar Chellala",
    cities: ["Ksar Chellala", "Frenda", "Rahouia", "Tagdempt", "Chehaida", "Hamadia", "Zmalet El Emir Abdelkader", "Tousnina"]
  },
  {
    name: "Ksar El Boukhari",
    cities: ["Ksar El Boukhari", "Aïn Boucif", "El Aissaouia", "Chahbounia", "Ben Chicao", "Boghar", "Ouled Deïd", "Bouchrahil"]
  },
  {
    name: "Messaad",
    cities: ["Messaad", "Moudjbara", "El Guedid", "Hassi Bahbah", "Charef", "Amourah", "Dar Chioukh", "Oum Laadham"]
  }
];

export const DELIVERY_FEE = 650; // DA