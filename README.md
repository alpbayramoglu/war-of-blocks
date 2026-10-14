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
- Rakibe isabet eden ya da suya düşen bir kalp kaybeder. Kalbi biten kaybeder.

## Dosyalar

| Dosya | Ne yapar |
| --- | --- |
| `index.html` | Sayfa, iPhone ayarları, "telefonu çevir" ekranı |
| `game.js` | Oyunun tamamı: çizim, arazi, fizik, bilgisayar rakip, ekranlar, sesler |
| `sw.js` | Çevrimdışı çalışma için önbellek |
| `manifest.webmanifest`, `icons/` | Ana ekran simgesi ve tam ekran ayarı |

Derleme adımı yok. Tüm görseller koddan piksel piksel çiziliyor, sesler Web Audio ile üretiliyor.

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
- `preview`: nişan noktalarının ne kadar ileriyi gösterdiği (saniye)

`game.js` dosyasını değiştirdikten sonra `sw.js` içindeki `CACHE` adını artırırsan (`war-of-blocks-v2` gibi), telefona eklenmiş sürüm de güncellenir.

## GitHub Pages

Repo ayarlarında **Settings → Pages → Source: Deploy from a branch**, dal `main`, klasör `/ (root)`.
