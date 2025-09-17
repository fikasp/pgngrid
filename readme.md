# PGNgrid 1.0

PGNgrid to prosta i intuicyjna aplikacja webowa, która pozwala na wizualizację partii szachowych z plików PGN. Zamiast przeglądać ruchy jeden po drugim, aplikacja renderuje całą partię jako siatkę plansz szachowych, gdzie każda plansza przedstawia pozycję po kolejnym posunięciu.

Jest to idealne narzędzie dla analityków, trenerów i miłośników szachów, którzy chcą szybko przeanalizować kluczowe momenty partii, wzorce pozycyjne lub błędy taktyczne.

## Główne funkcje

* **Wczytywanie plików PGN:** Proste przeciągnij i upuść lub wybierz plik z komputera. Aplikacja obsługuje pliki z wieloma partiami, umożliwiając łatwe przełączanie się między nimi.
* **Wizualizacja:** Każdy ruch w partii jest renderowany na osobnej planszy, co tworzy widok "siatki" postępu gry.
* **Konfigurowalne ustawienia:**
    * **Rozmiar:** Możliwość dostosowania wielkości planszy poprzez zmianę ilości kolumn.
    * **Orientacja:** Wybór, czy plansze mają być oglądane z perspektywy białych, czy czarnych.
    * **Kolory:** Dostosowywanie kolorów ciemnych pól oraz koloru podświetlenia ostatniego ruchu.
* **Intuicyjna nawigacja:** Łatwe przełączanie się między partiami za pomocą listy rozwijanej lub przewijania kółkiem myszy.
* **Wydruk do PDF:** Opcja wydruku siatki plansz, idealna do tworzenia materiałów treningowych lub analiz offline.

## Wskazówki użytkowania

1.  **Wczytaj plik PGN:** Przeciągnij i upuść plik `.pgn` na główny obszar strony lub kliknij ikonę folderu.
2.  **Przeglądaj partie:** Jeśli plik zawiera wiele partii, wybierz interesującą Cię grę z listy rozwijanej w nagłówku. Możesz również użyć kółka myszy na liście, aby szybko przechodzić do kolejnych partii.
3.  **Dostosuj widok:** Kliknij ikonę koła zębatego, aby otworzyć ustawienia i spersonalizować wygląd plansz.
4.  **Drukuj:** Użyj ikony drukarki, aby wydrukować siatkę plansz wybranej partii do pliku PDF lub bezpośrednio na papier.

## Technologie

* **HTML5:** Struktura.
* **CSS3:** Stylizacja interfejsu.
* **JavaScript (ES6+):** Logika aplikacji.
* **`jQuery`:** Biblioteka do manipulacji DOM i obsługi zdarzeń.
* **`chess.js`:** Biblioteka do obsługi logiki szachowej i parsowania PGN.
* **`chessboard.js`:** Biblioteka do renderowania interaktywnych plansz szachowych.
* **`html2pdf.js`:** Biblioteka do konwersji HTML do PDF.
* **`Font Awesome`:** Biblioteka ikon.

## Autor

**Przemysław Fikas**