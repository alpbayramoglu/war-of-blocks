# War of Blocks

Bloklardan yapılmış adalarda penguen ve kedinin sırayla kartopu attığı, Worms tarzı bir oyun. 6 yaşındaki bir çocuğun iPhone'da oynaması için tasarlandı: okuma gerektirmeyen büyük düğmeler, sapan gibi çek-bırak nişan alma, kaybedince ceza yok.

## Oynamak

GitHub Pages adresini iPhone'da Safari ile aç, telefonu yan çevir.

Tam ekran ve çevrimdışı oynamak için: Safari'de **Paylaş → Ana Ekrana Ekle**. Oyun artık bir uygulama gibi açılır, internet olmadan da çalışır.

## Modlar

- **1 oyuncu:** Bilgisayara karşı 6 bölüm, 2 ada (Çimen Adası, Kar Adası). Her bölüm bir öncekini geçince açılır. Kazanınca kalan kalp sayısı kadar yıldız kazanılır. İlerleme telefondaki tarayıcıya kaydedilir.
- **2 oyuncu:** Aynı telefonda sırayla. Çimen, Kar ya da her seferinde yeni üretilen Sürpriz haritası.

## Nasıl oynanır

- Ekranda herhangi bir yere dokun, parmağını geri çek, bırak. Ne kadar çekersen o kadar güçlü atar.
- Sol alttaki oklarla karakter her turda biraz yürüyebilir.
- Alttaki eşyalar: **kartopu** (sınırsız), **su balonu** (büyük patlar, rüzgârdan çok etkilenir), **boya küpü** (bir kez zıplar, patlayınca etrafı pembeye boyar). Balon ve boya maç başına birer tane.
- Üstteki oklar rüzgârın yönünü ve gücünü gösterir.
- Her maçta rastgele iki kez bir uçak geçip paraşütlü bir **sürpriz kutu** bırakır. Kutuya yürüyen ya da yakınına atış yapan alır. İçinden bir kalp (en fazla 3) ya da bir eşya çıkar: su balonu, boya küpü ya da yalnızca kutudan çıkan **balık** (daha düz ve uzağa uçar, rüzgârdan az etkilenir).
- Rakibe isabet eden ya da suya düşen bir kalp kaybeder. Kalbi biten kaybeder.

## Dosyalar

| Dosya | Ne yapar |
| --- | --- |
| `index.html` | Sayfa, iPhone ayarları, "telefonu çevir" ekranı |
| `game.js` | Oyunun tamamı: çizim, arazi, fizik, bilgisayar rakip, ekranlar, sesler |
| `sw.js` | Çevrimdışı çalışma için önbellek |
| `fonts/` | Baloo 2 ExtraBold yazı tipi, Türkçe harfler dahil (SIL OFL 1.1, `fonts/OFL-baloo2.txt`), çevrimdışı çalışsın diye repo içinde |
| `manifest.webmanifest`, `icons/` | Ana ekran simgesi ve tam ekran ayarı |

Derleme adımı yok. Tüm görseller kodla vektör olarak çiziliyor ("Oyuncak Bloklar" stili: yuvarlak köşeli bloklar, kalın dış çizgili karakterler), sesler Web Audio ile üretiliyor. Çizimler `game.js` içindeki *Vektör çizimler* bölümünde; `ART` tablosu her şeklin adını çizim fonksiyonuna bağlar.

## Yerelde denemek

```sh
python3 -m http.server 8000
```

Sonra `http://localhost:8000` adresini aç. Service worker yalnızca https'te (GitHub Pages) devreye girer.

## Ayar yapmak

Bölümler `game.js` içindeki `LEVELS` dizisinde. Her bölümde:

- `h`: arazinin yükseklik fonksiyonu
- `p`, `e`: penguen ve kedinin başladığı sütun
- `wind`: en yüksek rüzgâr (0–3)
- `items`: açık olan eşyalar
- `err`: bilgisayarın ne kadar ıskaladığı (büyük sayı, daha kolay)
- `preview`: nişan noktalarının yolun ne kadarını gösterdiği (piksel; rakibe kadar uzanmasın diye kısa tutuluyor)

Telefona eklenmiş oyun bütün dosyaları tek sürüm olarak önbellekten açar. **Her yayında `sw.js` içindeki `CACHE` adını artır** (`war-of-blocks-v5` gibi); artırmazsan telefon eski sürümde kalır. Yeni sürüm açılışta arka planda iner, maç sürmüyorsa sayfa bir kez kendini yeniler. Dosya ekler ya da çıkarırsan `ASSETS` listesini de güncelle.

Ses iPhone sessiz moddayken de çalar (`navigator.audioSession.type = 'playback'`).

## GitHub Pages

Repo ayarlarında **Settings → Pages → Source: Deploy from a branch**, dal `main`, klasör `/ (root)`.
