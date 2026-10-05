'use strict';

const DEFAULT_MENU = [
  {
    id: 'breakfast',
    title: 'Breakfast Specials',
    subtitle: 'Dawn delights, steamed, crisp & golden',
    note: 'Served fresh every morning from 06:00 AM',
    items: [
      { name: 'Idli with Sambar & Chutney', price: 40 },
      { name: 'Medu Vada', price: 12 },
      { name: 'Idiyappam with Coconut Milk', price: 30 },
      { name: 'Upma', price: 35 },
      { name: 'Poori Masala', price: 45 },
      { name: 'Dosa', price: 55 },
      { name: 'Poori Masala (Royal Portion)', price: 55 },
      { name: 'Masala Dosa', price: 80 },
    ],
  },
  {
    id: 'lunch',
    title: 'Lunch Combos',
    subtitle: 'Hearty plates that heal the day\u2019s damage',
    note: 'Generous meals, served with love',
    items: [
      { name: 'Curd Rice', price: 50 },
      { name: 'South Indian Veg-Meals', price: 90 },
      { name: 'North Indian Veg-Meals', price: 90 },
      { name: 'Non-veg Meals', price: 150 },
      { name: 'Fish Meals (2 pcs of fish)', price: 150 },
      { name: 'Chicken Biriyani & Chicken 65', price: 180 },
      { name: 'Mutton Biriyani & Mutton gravy', price: 300 },
    ],
  },
  {
    id: 'dinner',
    title: 'Dinner Delights',
    subtitle: 'Evening feasts worth staying up for',
    note: 'Served until 10:00 PM',
    items: [
      { name: 'Chapati (3pcs) with Vegetable Curry', price: 40 },
      { name: 'Idli with Sambar & Chutney', price: 40 },
      { name: 'Ghee Roast', price: 90 },
      { name: 'Veg Fried Rice', price: 90 },
      { name: 'Veg Noodles', price: 90 },
      { name: 'Parotta with Beef Curry', price: 110 },
      { name: 'Combo (Chicken 65, Mutton Soup, Half-Boil Egg)', price: 120 },
      { name: 'Chicken Noodles', price: 120 },
      { name: 'Chicken Fried Rice', price: 120 },
    ],
  },
  {
    id: 'desserts',
    title: 'Desserts & Beverages',
    subtitle: 'Sweet endings & sips of joy',
    note: 'Life is short \u2014 dessert first',
    items: [
      { name: 'Tea', price: 15 },
      { name: 'Coffee', price: 25 },
      { name: 'Lemon Juice', price: 20 },
      { name: 'Rose Milk', price: 35 },
      { name: 'Badam Milk', price: 35 },
      { name: 'Oreo Milkshake', price: 55 },
      { name: 'Falooda', price: 80 },
      { name: 'Sweet Bun', price: 20 },
      { name: 'Carrot Halwa', price: 35 },
      { name: 'Chocolate Cake', price: 35 },
      { name: 'Black Forest Cake', price: 60 },
      { name: 'White Forest Cake', price: 60 },
      { name: 'Red Velvet Cake', price: 80 },
    ],
  },
];


const DISH_IMAGES = {
  'Idli with Sambar & Chutney': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_5064a6c9-603b-4b3a-9c9e-168ecff508cb.jpg',
  'Medu Vada': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_dcb90174-3a65-4d51-9868-bd2e7020ca6a.jpg',
  'Idiyappam with Coconut Milk': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_5f1f726b-b1bd-43d5-8245-bf02b65822e2.jpg',
  'Upma': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_0a7006e3-fdc5-4471-82ec-43d6d25178be.jpg',
  'Poori Masala': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_1b0fe8a3-ea6a-46ee-889c-0717b03bfdfb.jpg',
  'Dosa': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_fcc9518e-9814-4dd5-98e2-274566cf06d5.jpg',
  'Poori Masala (Royal Portion)': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_1b0fe8a3-ea6a-46ee-889c-0717b03bfdfb.jpg',
  'Masala Dosa': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_63b25163-1a02-4b8c-b61a-33ff786d6294.jpg',
  'Curd Rice': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_e5fad619-f2d8-458d-96e2-398963603fe6.jpg',
  'South Indian Veg-Meals': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_75a6cd08-41e7-4175-a6e5-f197f234b562.jpg',
  'North Indian Veg-Meals': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_738fd588-c1e9-4863-bc0c-58f588fab136.jpg',
  'Non-veg Meals': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_49f040d3-780a-4c58-9ee6-3e293e727bd5.jpg',
  'Fish Meals (2 pcs of fish)': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_dafded57-1c89-40c5-a866-ed99678abd12.jpg',
  'Chicken Biriyani & Chicken 65': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_25b37672-0917-49ab-b5a9-2794454c4255.jpg',
  'Mutton Biriyani & Mutton gravy': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_99ef18d9-cb0a-4b6f-a166-c5a313e6a7a2.jpg',
  'Chapati (3pcs) with Vegetable Curry': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_398361c9-8378-4152-97d4-352d3e1c90a6.jpg',
  'Ghee Roast': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_2756f62a-1ab2-4fe0-9892-01a3916d2384.jpg',
  'Veg Fried Rice': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_7e160915-1218-44dd-8f87-35278a7d2dcd.jpg',
  'Veg Noodles': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_1937dc9a-43b0-4b1c-b5b9-d0204fe0c6b6.jpg',
  'Parotta with Beef Curry': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_876117ad-3756-45af-8f5c-9ca6508c38d7.jpg',
  'Combo (Chicken 65, Mutton Soup, Half-Boil Egg)': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_ca81659e-3359-4f14-b468-9ac8af17a3ab.jpg',
  'Chicken Noodles': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_84303e9b-57df-482d-a18a-9050591b6903.jpg',
  'Chicken Fried Rice': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_1559dd24-9523-42d3-9ee0-2599a5e5597b.jpg',
  'Tea': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_a9473332-1b6c-4d57-880d-0d7a7fe83047.jpg',
  'Coffee': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_57dbb09a-9efa-415c-b59e-b005fc2fc5d4.jpg',
  'Lemon Juice': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_11c18d04-44ed-4ec5-942c-5b7820216e39.jpg',
  'Rose Milk': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_8a48c809-de05-4e72-b7d5-879a9abcf9f3.jpg',
  'Badam Milk': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_c5991774-c7dc-4226-affc-863d1cc2c0c5.jpg',
  'Oreo Milkshake': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_7981a153-972d-4dd6-ad03-d9c96b0cfdaf.jpg',
  'Falooda': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_83260f9b-5463-453f-a57f-ccf4bc1f7b78.jpg',
  'Sweet Bun': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_6c51adad-e099-4426-9bf5-8d7f02831745.jpg',
  'Carrot Halwa': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_673ce70a-8ef1-49fc-9ea7-9c9227e2e053.jpg',
  'Chocolate Cake': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_0982f538-0afb-4e41-a99f-87bc26d0c659.jpg',
  'Black Forest Cake': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_bc41d1f1-4ed4-44d4-8a1d-97ce7cf3ab90.jpg',
  'White Forest Cake': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_4e1d71ef-6cbd-4b3c-89b3-beb017410ff5.jpg',
  'Red Velvet Cake': 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_7b4550d0-682a-4b0a-84da-f1bb5272debd.jpg',
};

function cloneMenu(menu){return JSON.parse(JSON.stringify(menu));}
function normalizeMenu(menu){if(!Array.isArray(menu))return [];return menu.slice(0,20).map(function(cat){return {id:String(cat.id||'cat').trim(),title:String(cat.title||'').trim(),subtitle:String(cat.subtitle||'').trim(),note:String(cat.note||'').trim(),items:(Array.isArray(cat.items)?cat.items:[]).slice(0,100).map(function(it){return {id:it.id||null,name:String(it.name||'').trim(),price:Math.max(0,Math.round(Number(it.price)||0)),img:String(it.img||'').trim()};}).filter(function(it){return it.name;})};}).filter(function(cat){return cat.title&&cat.items.length;});}
function isValidMenu(menu){return Array.isArray(menu)&&menu.length>0&&menu.every(function(c){return c.title&&Array.isArray(c.items);});}
function attachDishImages(menu){menu.forEach(function(c){c.items.forEach(function(it){if(!it.img&&DISH_IMAGES[it.name])it.img=DISH_IMAGES[it.name];});});return menu;}
async function loadMenu(){try{var r=await window.sb.from('menu_categories').select('id,title,subtitle,note,sort_order,menu_items(id,name,price,image_url,sort_order)').order('sort_order');if(r.error)throw r.error;var menu=(r.data||[]).map(function(c){return {id:c.id,title:c.title,subtitle:c.subtitle,note:c.note,items:(c.menu_items||[]).sort(function(a,b){return a.sort_order-b.sort_order;}).map(function(i){return {id:i.id,name:i.name,price:i.price,img:i.image_url||''};})};});if(isValidMenu(menu))return attachDishImages(menu);}catch(e){console.warn('Menu could not be loaded from Supabase; using built-in defaults.',e);}return attachDishImages(cloneMenu(DEFAULT_MENU));}
async function saveMenu(menu){try{var clean=normalizeMenu(menu);if(!isValidMenu(clean))return false;var r=await window.sb.from('menu_categories').upsert(clean.map(function(c,i){return {id:c.id,title:c.title,subtitle:c.subtitle,note:c.note,sort_order:i,updated_at:new Date().toISOString()};}),{onConflict:'id'});if(r.error)throw r.error;r=await window.sb.from('menu_items').delete().in('category_id',clean.map(function(c){return c.id;}));if(r.error)throw r.error;var rows=[];clean.forEach(function(c){c.items.forEach(function(i,ii){rows.push({category_id:c.id,name:i.name,price:i.price,image_url:i.img||'',sort_order:ii});});});r=await window.sb.from('menu_items').insert(rows);if(r.error)throw r.error;return true;}catch(e){console.error('Supabase menu save failed',e);return false;}}
async function resetMenu(){return saveMenu(DEFAULT_MENU);}
function menuSource(){return 'supabase';}
