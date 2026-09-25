# Ahmet Haktan Eker — kişisel yayın alanı

## Önce bilgisayarda bak

ZIP'i çıkar ve `index.html` dosyasını tarayıcıda aç. Sayfalar ve kaydırma sahnesi derleme veya kurulum istemez. E-posta kopyalama düğmesi HTTPS yayında görünür; yerelde e-posta bağlantısı çalışmaya devam eder.

## GitHub'a yükle

ZIP dosyasını değil, içindeki dosya ve klasörleri `ahmethaktaneker/ahmethaktaneker` reposunun köküne yükle. `index.html` kökte, `assets`, `yazilar`, `hakkimda`, `iletisim` onun yanında olmalı. Mevcut dosyaları aynı isimlerle değiştir. Eski `_next` klasörü artık kullanılmıyor; kaldırılabilir. Mevcut başka resim dosyaların varsa onları koruyabilirsin.

`CNAME` mevcut alan adını korur: `www.ahmethaktaneker.com`. GitHub Pages, ana dalın kökünden servis edecek şekilde ayarlanmış olmalı. `.nojekyll` dosyasını da ekle. Önceki build workflow'un varsa bu düz HTML dosyalarını eski Next çıktısıyla üzerine yazmamalı; kökten yayın veya kökü yayınlayan workflow kullan.

## Fotoğrafı ekle

Fotoğrafını `assets/portrait.jpg` adıyla koy. Gerçek JPEG dosyası olmalı; yalnızca PNG dosyasının uzantısını değiştirme.

- Ana sayfada ve Hakkımda sayfasında otomatik görünür.
- Fotoğraf yokken tasarıma ait monogram görünür; ziyaretçi kırık resim görmez.
- Dikey 4:5 fotoğraf uygundur. Örneğin 1200 × 1500 px.
- Görüntü çerçeveye sığdırılır. Kadrajı değiştirmek için `assets/site.css` içindeki `.portrait img` kuralında `object-position: center 40%` değerini ayarla.
- Yeni fotoğrafı aynı adla yükledikten sonra tarayıcıda sert yenileme yap.

## Metin ve yazı düzenleme

- Ana sayfa: `index.html`
- Arşiv: `yazilar/index.html`
- Hakkımda: `hakkimda/index.html`
- İletişim: `iletisim/index.html`
- Tasarım: `assets/site.css`
- Kaydırma ve fotoğraf davranışı: `assets/site.js`

Arşivdeki gerçek Medium yazısı korunmuştur. Henüz yayımlanmayan metinler yayımlanmış gibi eklenmemiştir. Yeni dış bağlantılı yazı eklerken arşivdeki `article-row` bağlantısını kopyala; başlığı, açıklamayı, bağlantıyı ve tarihi değiştir. Üstteki yazı sayısını güncelle. Sitede yayımlayacağın uzun yazılar için `YAZI-SABLONU.txt` dosyasındaki HTML'i kullanabilirsin.

Biyografi metinleri tasarım için düzenlenmiş taslaklardır; yayımlamadan önce ifadelerin seni doğru anlattığını kontrol et.

## Hareket ve erişilebilirlik

Ana sayfadaki defter doğal kaydırmaya bağlı olarak açılır; sayfa kaydırmasını ele geçirmez. Hareketi azalt ayarında ve kısa ekranlarda uzun sabit sahne devre dışı kalır. Menü ve metin bağlantıları JavaScript olmadan da çalışır. Klavye odağı ve içeriğe geç bağlantısı bulunur. Yazı bağlantısı hem açılan defterde hem aşağıdaki normal listede yer alır.

## Kontroller

HTML yapısı, yerel sayfa/dosya bağlantıları, CSS sözdizimi ve JavaScript sözdizimi kontrol edildi. Eski ikonlar aynen korundu. Bu ortamın tarayıcısı yerel sunucuyu açamadığı için gerçek tarayıcıda masaüstü/mobil görsel ve etkileşim doğrulaması tamamlanamadı. Canlıya almadan önce açılışta kaydırmayı, üç iç sayfayı ve fotoğraf yüklemesini kendi tarayıcında kontrol et.
