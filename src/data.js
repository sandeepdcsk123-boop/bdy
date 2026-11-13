// ====== YAHAN SAB KUCH APNE HISAAB SE BADLO ======
export const NAME = 'Priyanka'
export const FULL = 'Priyanka Sharma'

export const TYPED = 'Tum meri zindagi ki sabse khoobsurat wajah ho. Aaj ka din sirf tumhare naam, meri jaan. 💖'

// Photos: bas src/photos/ folder mein daalo, apne aap aa jayengi (naam ke order mein).
// Caption badalna ho to yahan file ka naam (bina .jpg) likho:
const CAPTIONS = {
  '01-smile-garden': 'Ye muskaan, meri favourite 💖',
  '02-rock-garden': 'Rock Garden wali yaadein',
  '03-green-anarkali': 'Is andaaz pe toh sab fida',
  '04-red-kurti': 'Ye selfie, ye hasi',
  '05-lake': 'Sukoon, bas tumhare saath',
  '06-plaid-sun': 'Dhoop mein bhi tum chamakti ho ☀️',
  '07-glasses-selfie': 'Meri pyaari chashmish',
  '08-maroon-kurta': 'Sadgi mein sabse sundar',
  '09-leopard-mirror': 'Style queen 😎',
}
const FALLBACK = ['Meri favourite', 'Ek aur pyaari yaad', 'Bas yahi hasi chahiye', 'Tum aur tumhari baatein']

const files = import.meta.glob('./photos/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG}', { eager: true, query: '?url', import: 'default' })
export const PHOTOS = Object.entries(files)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([p, src], i) => {
    const k = p.split('/').pop().replace(/\.\w+$/, '')
    return { src, cap: CAPTIONS[k] || FALLBACK[i % FALLBACK.length] }
  })

export const REASONS = [
  'Teri hasi meri saari thakaan utaar deti hai',
  'Tum meri baat bina bole samajh jaati ho',
  'Tumhari masoomiyat 🥺',
  'Tumhara pagalpan mujhe bahut pasand hai',
  'Tumhare saath sab theek lagta hai',
  'Tumhari care karne ki aadat',
  'Tumhari aankhein ✨',
  'Tum jaisi ho, waisi hi sabse pyaari ho',
  'Tumne mujhe behtar insaan banaya',
  'Bas tum ho, isliye 💖',
]

export const LETTER = [
  'Meri Priyanka,',
  'Aaj tumhara din hai, aur main chahta hu ki tum aaj sirf muskurao. Tumne meri zindagi mein jo khushi layi hai, uske liye shukriya bolna bahut chhota lagta hai.',
  'Tumhari hasi, tumhari baatein aur tumhara saath, mere liye sabse khaas hai. Wada karta hu ki har mushkil mein tumhare saath rahunga.',
  'Janamdin mubarak ho, meri jaan. 🎂💖',
  'Hamesha tumhara ❤️',
]

export const COUPONS = [
  { t: '🎬 Ek movie date', d: 'Tap karke redeem karo' },
  { t: '🤗 Ek lamba sa hug', d: 'Tap karke redeem karo' },
  { t: '🍕 Tumhari pasand ka khana', d: 'Tap karke redeem karo' },
]
