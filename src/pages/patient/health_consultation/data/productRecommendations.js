// Mock product recommendation data
// In production, this would be fetched from an API based on symptoms

export const PRODUCT_CATALOG = [
  {
    id: 'b5-nutri-sculpt-synexo',
    name: 'B5-Nutri-Sculpt SynExo Serum',
    brand: 'EboScience',
    tagline: 'Patented LNP Nano Technology & Vitamin B5 Repair',
    size: '30ml',
    price: 299.00,
    currency: 'CAD',
    image: 'https://eboscience.com/cdn/shop/files/b5_a82a38e2-4493-4743-a521-782930575aa0.png?v=1759335147',
    url: 'https://eboscience.com/products/b5-nutri-sculpt-synexo-serum',
    badge: 'Clinician Recommended',
    rating: 4.8,
    reviewCount: 127,
    keyBenefits: [
      'Professional Barrier Support',
      'Intensive Surface Hydration',
      'Post-Procedure Soothing Care',
      'Advanced Antioxidant Shield',
    ],
    ingredients: ['Panthenol (B5)', 'Hyaluronic Acid', 'Aloe Barbadensis', 'miniHA'],
    madeIn: 'Canada',
    tags: ['sensitive-skin', 'dry-skin', 'inflammation', 'redness', 'post-procedure'],
    matchReasons: {
      'dry-skin': 'Hyaluronic Acid provides deep surface hydration',
      'sensitive-skin': 'Fragrance-free, gentle formula ideal for reactive skin',
      'inflammation': 'Aloe and B5 calm visible redness and irritation',
      'redness': 'Pro-Vitamin B5 soothes and supports the skin barrier',
      'itching': 'Barrier-repair formula reduces discomfort from dry, irritated skin',
    },
    matchScore: {
      'dry-skin': 95,
      'sensitive-skin': 92,
      'inflammation': 88,
      'redness': 90,
      'itching': 85,
      'numbness': 60,
      'fatigue': 40,
    },
  },
];

/**
 * Symptom keyword → product tag mapping
 * Used to match conversation symptoms to relevant products
 */
export const SYMPTOM_PRODUCT_MAP = {
  // Skin symptoms
  dry: ['dry-skin'],
  itch: ['sensitive-skin', 'dry-skin'],
  itching: ['sensitive-skin', 'dry-skin'],
  redness: ['inflammation', 'redness'],
  red: ['inflammation', 'redness'],
  irritat: ['sensitive-skin', 'inflammation'],
  sensitiv: ['sensitive-skin'],
  inflam: ['inflammation'],
  eczema: ['sensitive-skin', 'inflammation', 'dry-skin'],
  acne: ['inflammation'],
  rash: ['inflammation', 'sensitive-skin', 'redness'],
  peeling: ['dry-skin'],
  flak: ['dry-skin'],
  numb: ['post-procedure'],
  
  // General symptoms that may have topical component
  burn: ['inflammation', 'sensitive-skin'],
  sting: ['sensitive-skin', 'inflammation'],
  tight: ['dry-skin'],
};

/**
 * Returns recommended products based on extracted symptom keywords from messages
 * @param {Array} messages - Chat messages array
 * @returns {Array} - Array of { product, matchScore, matchReasons }
 */
export function getRecommendedProducts(messages) {
  const userText = messages
    .filter(m => m.role === 'user')
    .map(m => m.content.toLowerCase())
    .join(' ');

  const matchedTags = new Set();

  Object.entries(SYMPTOM_PRODUCT_MAP).forEach(([keyword, tags]) => {
    if (userText.includes(keyword)) {
      tags.forEach(tag => matchedTags.add(tag));
    }
  });

  if (matchedTags.size === 0) return [];

  return PRODUCT_CATALOG
    .map(product => {
      const scores = [...matchedTags].map(tag => product.matchScore[tag] || 0);
      const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

      const reasons = [...matchedTags]
        .filter(tag => product.matchReasons[tag])
        .map(tag => product.matchReasons[tag]);

      return { product, score: avgScore, reasons };
    })
    .filter(r => r.score >= 50)
    .sort((a, b) => b.score - a.score);
}

const tempProducts = [
    {
        "product_id": 1,
        "name": "EboScience Anti-Aging Nano-particle SynExo Serum 30ml",
        "category": "serum",
        "description": "Visible Wrinkle Smoothing, Barrier Support & Resilience, Intensive Surface Hydration",
        "benefits": ["hydration", "anti-aging", "soothing"],
    },
    {
        "product_id": 2,
        "name": "Acne-Control Serum",
        "category": "serum",
        "description": "Lightweight serum for acne-prone skin with salicylic acid",
        "price": 28,
        "rating": 4.3,
        "benefits": ["acne-fighting", "oil-control", "pore-cleansing"],
        "genetic_fit": ["oily_prone_gene", "acne_prone_gene"],
        "contraindications": ["sensitive_skin_gene"]
    },
    {
        "product_id": 3,
        "name": "Gentle Cleanser",
        "category": "cleanser",
        "description": "Mild cleanser suitable for sensitive skin, fragrance-free",
        "price": 18,
        "rating": 4.7,
        "benefits": ["gentle-cleansing", "soothing", "safe-for-sensitive"],
        "genetic_fit": ["sensitive_skin_gene", "dry_skin_gene", "oily_prone_gene"],
        "contraindications": []
    },
    {
        "product_id": 4,
        "name": "Vitamin C Brightening Serum",
        "category": "serum",
        "description": "Brightening serum to reduce dullness and uneven tone",
        "price": 45,
        "rating": 4.6,
        "benefits": ["brightening", "anti-dullness", "radiance"],
        "genetic_fit": ["all"], 
        "contraindications": []
    },
    {
        "product_id": 5,
        "name": "Oil-Control Face Mask",
        "category": "mask",
        "description": "Clay mask to control excess oil and unclog pores",
        "price": 22,
        "rating": 4.2,
        "benefits": ["oil-control", "pore-cleansing", "detoxifying"],
        "genetic_fit": ["oily_prone_gene"],
        "contraindications": ["dry_skin_gene", "sensitive_skin_gene"]
    },
    {
        "product_id": 6,
        "name": "Anti-Aging Eye Cream",
        "category": "eye-cream",
        "description": "Nourishing eye cream to reduce wrinkles and fine lines",
        "price": 55,
        "rating": 4.8,
        "benefits": ["anti-aging", "hydration", "brightening"],
        "genetic_fit": ["dry_skin_gene"],
        "contraindications": []
    },
]

