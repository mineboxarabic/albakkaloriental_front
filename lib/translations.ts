import type { Language } from "@/lib/language";
import { AR_AUTH } from "@/lib/i18n/ar-auth";
import { AR_RETAIL } from "@/lib/i18n/ar-retail";
import { AR_PRO } from "@/lib/i18n/ar-pro";
import { AR_SHARED } from "@/lib/i18n/ar-shared";

const AR_CATALOG: Record<string, string> = {
  "Pagination du catalogue": "صفحات الكتالوج",
  "Page {page} sur {total}": "الصفحة {page} من {total}",
  Précédent: "السابق",
  Suivant: "التالي",
  "Bandeau de consentement aux cookies": "إشعار ملفات تعريف الارتباط",
  Fermer: "إغلاق",
  "Nous utilisons uniquement des cookies techniques (session, panier). Aucun traceur publicitaire ou statistique tiers. Consultez notre":
    "نستخدم ملفات تعريف الارتباط الضرورية فقط للجلسة والسلة، دون أدوات تتبع إعلانية أو إحصائية خارجية. اطلع على",
  "politique de confidentialité": "سياسة الخصوصية",
  "J'ai compris": "فهمت",
  "Nos catégories": "أقسامنا",
  "Tous vos essentiels, simplement.": "كل ما تحتاجه، بكل بساطة.",
  "Aucune catégorie disponible pour le moment.": "لا توجد أقسام متاحة حالياً.",
  Catégories: "الأقسام",
  "Tous les produits": "جميع المنتجات",
  "Catalogue professionnel": "كتالوج الجملة",
  produit: "منتج",
  produits: "منتجات",
  Produits: "المنتجات",
  Marques: "العلامات التجارية",
  "Aucun produit trouvé.": "لم يتم العثور على منتجات.",
  "Le catalogue est temporairement indisponible.": "الكتالوج غير متاح مؤقتاً.",
  "Rechercher un produit...": "ابحث عن منتج...",
  "Rechercher un produit, un SKU...": "ابحث عن منتج أو رمز...",
  Rechercher: "بحث",
  "Rechercher dans le catalogue": "البحث في الكتالوج",
  "Effacer la recherche": "مسح البحث",
  "Trier les produits": "ترتيب المنتجات",
  Pertinence: "الأكثر صلة",
  "Prix : croissant": "السعر: من الأقل إلى الأعلى",
  "Prix : décroissant": "السعر: من الأعلى إلى الأقل",
  "Nom : A → Z": "الاسم: أبجدياً",
  "Livraison à domicile dans toute la region PACA":
    "توصيل إلى المنزل في منطقة PACA",
  "Besoin d'aide ?": "تحتاج مساعدة؟",
  "Espace pro": "للعملاء المهنيين",
  "Se connecter": "تسجيل الدخول",
  "Ouvrir le menu": "فتح القائمة",
  "Le Bakkal Oriental: accueil": "البقال الشرقي: الرئيسية",
  "Mon compte": "حسابي",
  "Bonjour,": "مرحباً،",
  "Mes infos": "معلوماتي",
  "Mes commandes": "طلباتي",
  Déconnexion: "تسجيل الخروج",
  "Ouvrir le panier": "فتح السلة",
  "TOUS LES RAYONS": "جميع الأقسام",
  Plus: "المزيد",
  MENU: "القائمة",
  "Fermer le menu": "إغلاق القائمة",
  Rayons: "الأقسام",
  "Le Bakkal Oriental: espace pro": "البقال الشرقي: بوابة المهنيين",
  PRO: "جملة",
  CATALOGUE: "الكتالوج",
  BOUTIQUE: "المتجر",
  PANIER: "السلة",
  "Se déconnecter": "تسجيل الخروج",
  "SE CONNECTER": "تسجيل الدخول",
  "ESPACE PRO": "بوابة المهنيين",
  "MON COMPTE": "حسابي",
  DÉCONNEXION: "تسجيل الخروج",
  "Votre épicerie orientale de confiance. Des produits authentiques, soigneusement sélectionnés, livrés partout en France.":
    "متجرك الموثوق للمنتجات الشرقية. منتجات أصلية مختارة بعناية مع التوصيل في فرنسا.",
  Catalogue: "الكتالوج",
  Commandes: "الطلبات",
  Factures: "الفواتير",
  Services: "خدماتنا",
  "À propos": "من نحن",
  CONTACT: "تواصل معنا",
  ". Tous droits réservés.": "، جميع الحقوق محفوظة.",
  CGV: "شروط البيع",
  Confidentialité: "الخصوصية",
  Contact: "تواصل معنا",
  Bientôt: "قريباً",
  RUPTURE: "نفد المخزون",
  Indisponible: "غير متاح",
  CARTON: "كرتونة",
  UNITÉ: "قطعة",
  "Connectez-vous pour voir le prix": "سجل دخولك لعرض السعر",
  "Ajouter au devis": "أضف إلى عرض السعر",
  "Le serveur est temporairement indisponible — le catalogue ne peut pas être chargé.":
    "الخادم غير متاح مؤقتاً، تعذر تحميل الكتالوج.",
  "Épicerie orientale": "بقالة شرقية",
  "Vos produits orientaux préférés,": "منتجاتك الشرقية المفضلة،",
  "livrés chez vous": "تصلك إلى باب بيتك",
  "Faites vos courses en ligne et recevez-les directement à domicile lors de nos tournées.":
    "تسوق عبر الإنترنت واستلم طلبك في المنزل خلال جولات التوصيل.",
  "Voir nos produits": "تصفح منتجاتنا",
  "LIVRAISON RAPIDE": "توصيل سريع",
  "CLICK & COLLECT": "اطلب واستلم",
  "PRIX ACCESSIBLES": "أسعار مناسبة",
  "SERVICE CLIENT": "خدمة العملاء",
  "Voir toutes les catégories": "عرض جميع الأقسام",
  "Épicerie orientale livrée chez vous": "البقالة الشرقية تصلك إلى بيتك",
  "Découvrez nos rayons et commandez en quelques clics.":
    "تصفح الأقسام واطلب بخطوات بسيطة.",
  "Voir le catalogue": "تصفح الكتالوج",
  "Épicerie orientale & halal": "بقالة شرقية وحلال",
  "Votre Épicerie Orientale et Halal en Ligne":
    "متجرك الإلكتروني للبقالة الشرقية والحلال",
  "Pourquoi Choisir Le Bakkal Oriental ?": "لماذا تختار البقال الشرقي؟",
  "Découvrez Les Saveurs Authentiques De L'Orient":
    "اكتشف النكهات الشرقية الأصيلة",
  "Le Bakkal Oriental met à l'honneur la richesse de la gastronomie orientale et méditerranéenne à travers une sélection de produits de qualité destinée aux particuliers comme aux passionnés de cuisine traditionnelle.":
    "يقدم البقال الشرقي تشكيلة منتقاة من المنتجات الشرقية والمتوسطية لكل محبي الطبخ التقليدي.",
  "Les meilleures ventes": "الأكثر مبيعاً",
  Nouveautés: "وصل حديثاً",
  Accueil: "الرئيسية",
  "Réf :": "الرمز:",
  "Prix TTC, livraison non incluse.": "السعر شامل الضريبة، دون تكلفة التوصيل.",
  "Rupture de stock": "نفد المخزون",
  "Ce produit est indisponible à la commande pour le moment.":
    "هذا المنتج غير متاح للطلب حالياً.",
  Suggestions: "اقتراحات",
  "Vous aimerez aussi": "قد يعجبك أيضاً",
  "Catalogue pro": "كتالوج الجملة",
  "Produits associés": "منتجات مشابهة",
  "Diminuer la quantité": "تقليل الكمية",
  "Augmenter la quantité": "زيادة الكمية",
  "Se connecter pour ajouter": "سجل دخولك للإضافة",
  "Ajouté au panier": "تمت الإضافة إلى السلة",
  "Ajouter au panier": "أضف إلى السلة",
  "Connectez-vous à votre compte professionnel pour voir les prix et commander.":
    "سجل دخولك بحساب الجملة لعرض الأسعار والطلب.",
  Prix: "السعر",
  "Sous-total pour cette ligne": "المجموع لهذا المنتج",
  "Produit en rupture": "المنتج غير متوفر",
  "Livraison à domicile": "توصيل إلى المنزل",
  "Click & collect": "اطلب واستلم",
  "Espace professionnels": "بوابة المهنيين",
  Promotions: "العروض",
  "Cartes cadeaux": "بطاقات الهدايا",
  "Qui sommes-nous": "من نحن",
  "Nos engagements": "التزاماتنا",
  "Mentions légales": "المعلومات القانونية",
  "Politique de confidentialité": "سياسة الخصوصية",
  "Quantité maximale atteinte": "تم الوصول إلى الكمية القصوى",
  "Connectez-vous pour ajouter au panier": "سجل دخولك للإضافة إلى السلة",
  "Carton de": "كرتونة من",
  pièces: "قطع",
  "UNITÉ HT": "القطعة دون الضريبة",
  "CARTON HT": "الكرتونة دون الضريبة",
  "Voir tout": "عرض الكل",
  "Bienvenue chez Le Bakkal Oriental, votre référence en matière d'épicerie orientale et de produits authentiques du bassin méditerranéen. Nous sélectionnons avec soin une large gamme de produits orientaux halal, d'épices, de conserves, de boissons, de douceurs traditionnelles et d'ingrédients indispensables à la préparation de recettes familiales riches en saveurs. Notre mission est de permettre à chacun de retrouver facilement les goûts authentiques de l'Orient grâce à une plateforme de courses halal en ligne simple, rapide et accessible partout en France.":
    "أهلاً بك في البقال الشرقي، وجهتك للمنتجات الشرقية والمتوسطية الأصيلة. نختار بعناية تشكيلة واسعة من البهارات والمعلبات والمشروبات والحلويات التقليدية ومكونات وصفاتك المفضلة. تسوق بسهولة واستمتع بالنكهات الشرقية مع التوصيل في فرنسا.",
};
export type TranslationParams = Record<string, string | number>;

const normalizeKey = (text: string) => text.replace(/\s+/g, " ").trim();

const ARABIC: Record<string, string> = Object.fromEntries(
  Object.entries({
    ...AR_CATALOG,
    ...AR_SHARED,
    ...AR_AUTH,
    ...AR_RETAIL,
    ...AR_PRO,
  }).map(([key, value]) => [normalizeKey(key), value]),
);

const LOWERCASE_ARABIC = Object.fromEntries(
  Object.entries(ARABIC).map(([key, value]) => [
    key.toLocaleLowerCase("fr"),
    value,
  ]),
);

function interpolate(text: string, params?: TranslationParams): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}

/** True when the French source string has an Arabic entry. */
export function hasArabicTranslation(text: string): boolean {
  const key = normalizeKey(text);
  return key in ARABIC || key.toLocaleLowerCase("fr") in LOWERCASE_ARABIC;
}

/**
 * Translates a French UI string. French is the source language: unknown
 * strings (product names, backend data, brand names) are returned untouched.
 * `{name}` placeholders are filled from `params` in both languages.
 */
export function translate(
  text: string,
  language: Language,
  params?: TranslationParams,
): string {
  if (language !== "ar") return interpolate(text, params);
  const key = normalizeKey(text);
  const arabic =
    ARABIC[key] ?? LOWERCASE_ARABIC[key.toLocaleLowerCase("fr")] ?? text;
  return interpolate(arabic, params);
}
