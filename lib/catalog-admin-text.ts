import type { Language } from './language';
const ar: Record<string, string> = {
  'Mode admin': 'وضع الإدارة', 'Tous les produits (admin)': 'كل المنتجات (إدارة)',
  'Gérer le produit': 'إدارة المنتج', 'Modifier dans le backend': 'تعديل في لوحة الإدارة',
  'Remplacer l’image': 'استبدال الصورة', 'Chercher une meilleure image': 'البحث عن صورة أفضل', 'Améliorer l’image': 'تحسين الصورة',
  'Où vendre': 'مكان البيع', 'Détail uniquement': 'مفرق فقط', 'Gros uniquement': 'جملة فقط', 'Détail et gros': 'مفرق وجملة',
  'Statut détail': 'حالة المفرق', 'Statut gros': 'حالة الجملة', 'Visible': 'ظاهر', 'Masqué': 'مخفي', 'Rupture': 'غير متوفر',
  'Enregistrer': 'حفظ', 'Annuler': 'إلغاء', 'Fermer': 'إغلاق', 'Chargement…': 'جار التحميل…', 'Préparation de l’aperçu…': 'جار تجهيز المعاينة…',
  'Image actuelle': 'الصورة الحالية', 'Nouvelle image': 'الصورة الجديدة', 'Aucune image': 'لا توجد صورة',
  'Choisir un fichier': 'اختر صورة', 'Lien de l’image': 'رابط الصورة', 'Prévisualiser le lien': 'معاينة الرابط',
  'Appliquer l’image': 'تطبيق الصورة', 'Aucune image trouvée. Essayez un lien ou un fichier.': 'لم نجد صورة. جرب رابطاً أو ملفاً.',
  'Vérifiez la marque, le format et les textes avant d’appliquer.': 'تأكد من العلامة التجارية والحجم والنصوص قبل التطبيق.',
  'Source': 'المصدر', 'Modifications enregistrées.': 'تم حفظ التغييرات.', 'Image appliquée.': 'تم تطبيق الصورة.',
  'Produits masqués inclus': 'بما فيها المنتجات المخفية', 'Retour au catalogue': 'العودة للكتالوج',
  'JPEG, PNG ou WebP · 5 Mo maximum': 'JPEG أو PNG أو WebP · حتى 5 ميغا',
};
export const adminText = (value: string, language: Language = 'fr') => language === 'ar' ? ar[value] ?? value : value;
