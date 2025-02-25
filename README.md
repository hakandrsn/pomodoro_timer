# Pomodoro Timer Uygulaması 🍅⏱️

Bu proje, Electron.js ile geliştirilmiş bir Pomodoro Timer uygulamasıdır. Uygulama, çalışma ve mola sürelerini yönetmenize yardımcı olur ve sesli bildirimlerle size hatırlatmalar yapar. Ayrıca, sistem seslerini otomatik olarak ayarlayarak dikkat dağıtıcıları en aza indirir.

---

## Özellikler ✨

- **Çalışma ve Mola Süreleri**: Kullanıcı tarafından belirlenen çalışma ve mola sürelerini yönetir.
- **Tekrar Sayısı**: Belirli sayıda çalışma-mola döngüsü ayarlayabilirsiniz.
- **Sesli Bildirimler**:
    - Çalışma süresi bittiğinde `work.mp3` çalar.
    - Mola süresi bittiğinde `break.mp3` çalar.
    - Sesler çalarken sistem sesleri otomatik olarak %5'e düşer.
- **Her Zaman Üstte**: Uygulamanın her zaman üstte kalmasını sağlayan bir seçenek.
- **Manuel Kontroller**:
    - **Durdur/Devam Et**: Timer'ı duraklatabilir veya devam ettirebilirsiniz.
    - **Sıfırla**: Timer'ı tamamen sıfırlayabilirsiniz.

---

## Kurulum 🛠️

Projeyi bilgisayarınıza kurmak için aşağıdaki adımları izleyin.

### Gereksinimler
- Node.js (v16 veya üzeri)
- npm (Node.js ile birlikte gelir)

### Adımlar
1. **Projeyi İndirin**:
   ```bash
   git clone https://github.com/sizin-kullanici-adiniz/pomodoro-timer.git
   cd pomodoro-timer