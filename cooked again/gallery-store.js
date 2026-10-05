'use strict';
const GALLERY_MAX_ITEMS=30;
const DEFAULT_GALLERY = [
  {
    src: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_7a236c0f-db77-48eb-ad78-154dbf886851.jpg',
    alt: 'Crispy golden ghee roast dosa served on a dark plate',
    caption: 'Ghee Roast',
  },
  {
    src: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_070e64ba-2780-40da-b119-bef8e17d16ce.jpg',
    alt: 'Kerala parotta served with rich beef curry',
    caption: 'Parotta with Beef Curry',
  },
  {
    src: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_f8937a31-3488-450e-8e92-c397d47900fa.jpg',
    alt: 'Idli and medu vada served with sambar and chutney on a banana leaf',
    caption: 'Idli & Medu Vada',
  },
  {
    src: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_702440d6-338d-42b7-99ca-cb9f6e5d3f65.jpg',
    alt: 'Traditional South Indian filter coffee in a steel tumbler and davara',
    caption: 'Filter Coffee',
  },
  {
    src: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_d8d2e687-f1b1-4411-8406-9d513b915ced.jpg',
    alt: 'Overhead view of a South Indian veg meal spread on a banana leaf',
    caption: 'Royal Veg Meals',
  },
  {
    src: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_a617852c-cbcc-4a44-9e4f-11b4fe3b58ee.jpg',
    alt: 'Chicken biryani garnished with fried onions alongside Chicken 65',
    caption: 'Chicken Biriyani & Chicken 65',
  },
  {
    src: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_7648361b-017c-4dc1-8250-32d13afcde47.jpg',
    alt: 'Royal falooda with ice cream and rose syrup in an elegant glass',
    caption: 'Falooda',
  },
  {
    src: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_efa77587-efd6-4407-8202-4a7a1b1c54e6.jpg',
    alt: 'A slice of red velvet cake with elegant plating',
    caption: 'Red Velvet Cake',
  },
  {
    src: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_f8f4d8cf-505d-45aa-bf80-f836450911bc.jpg',
    alt: 'Indo-Chinese chicken noodles garnished with spring onions',
    caption: 'Chicken Noodles',
  },
  {
    src: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_c0c6e19b-a96e-4c8b-b403-a9ee7a4f7ae3.jpg',
    alt: 'Golden crispy masala dosa with sambar and chutney',
    caption: 'Masala Dosa',
  },
];



function cloneGallery(g){return JSON.parse(JSON.stringify(g));}
function normalizeGallery(g){if(!Array.isArray(g))return [];return g.slice(0,30).map(function(x){var src=String(x&&x.src||'').trim();var caption=String(x&&x.caption||'').trim();var alt=String(x&&x.alt||'').trim()||caption||'Dish photo at A COOKED AGAIN';return {id:x&&x.id||null,src:src,alt:alt,caption:caption};}).filter(function(x){return x.src;});}
function isValidGallery(g){return Array.isArray(g)&&g.length>0&&g.every(function(x){return x.src;});}
async function loadGallery(){try{var r=await window.sb.from('gallery_items').select('id,src,alt,caption,sort_order').order('sort_order');if(r.error)throw r.error;var g=(r.data||[]).map(function(x){return {id:x.id,src:x.src,alt:x.alt,caption:x.caption};});if(isValidGallery(g))return g;}catch(e){console.warn('Gallery could not be loaded from Supabase; using built-in defaults.',e);}return cloneGallery(DEFAULT_GALLERY);}
async function saveGallery(gallery){try{var clean=normalizeGallery(gallery);if(!isValidGallery(clean))return false;var r=await window.sb.from('gallery_items').delete().neq('id','00000000-0000-0000-0000-000000000000');if(r.error)throw r.error;r=await window.sb.from('gallery_items').insert(clean.map(function(x,i){return {src:x.src,alt:x.alt,caption:x.caption,sort_order:i};}));if(r.error)throw r.error;return true;}catch(e){console.error('Supabase gallery save failed',e);return false;}}
async function resetGallery(){return saveGallery(DEFAULT_GALLERY);}
function gallerySource(){return 'supabase';}
