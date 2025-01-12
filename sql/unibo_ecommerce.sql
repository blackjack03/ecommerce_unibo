-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Gen 12, 2025 alle 22:55
-- Versione del server: 10.4.32-MariaDB
-- Versione PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `unibo_ecommerce`
--

-- --------------------------------------------------------

--
-- Struttura della tabella `carte`
--

CREATE TABLE `carte` (
  `id_carta` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `nome_carta` text NOT NULL,
  `nome_sulla_carta` text NOT NULL,
  `numero_carta` text NOT NULL,
  `CVV` varchar(4) NOT NULL,
  `scadenza` varchar(7) NOT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Dump dei dati per la tabella `carte`
--

INSERT INTO `carte` (`id_carta`, `user_id`, `nome_carta`, `nome_sulla_carta`, `numero_carta`, `CVV`, `scadenza`, `is_default`) VALUES
(10, 2, 'Prima Carta', 'Jack Casa', '5555555555555555', '5555', '04/27', 1),
(12, 2, 'Seconda', 'Jack Casa', '4444444444444444', '4444', '01/30', 0);

-- --------------------------------------------------------

--
-- Struttura della tabella `notifiche`
--

CREATE TABLE `notifiche` (
  `notify_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `created_by` enum('admin','user') NOT NULL,
  `oggetto` text NOT NULL,
  `testo` mediumtext NOT NULL,
  `timestamp` bigint(20) UNSIGNED NOT NULL,
  `da_leggere` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Dump dei dati per la tabella `notifiche`
--

INSERT INTO `notifiche` (`notify_id`, `user_id`, `created_by`, `oggetto`, `testo`, `timestamp`, `da_leggere`) VALUES
(37, 2, 'user', 'Nuovo Ordine', 'È stato effettuato un nuovo ordine!<br/>Sono stati ordinati 1 prodotto per un totale di 999.99 €.<br/><a href=\'order.html?id=44\'>Clicca qui per visualizzare tutti i dettagli dell\'ordine</a>', 1736613417, 0),
(38, 2, 'user', 'Recensione Aggiunta! (5 stelle)', 'L\'utente Jack (e-mail dell\'utente: <em>test@mail.com</em>) ha appena aggiunto una recensione ad un prodotto! (<a href=\'product.html?id=26\'>Visualizza il Prodotto Cliccando Qui</a>)<br/>L\'utente ha recensito il prodotto con <strong>5 stelle</strong> e mettendo come titolo <strong>Buon Tablet</strong>', 1736617261, 0),
(39, 2, 'admin', 'Stato della Spedizione Cambiato!', 'Lo stato di un tuo ordine (<a href=\'order.html?id=44\'>clicca qui per vederlo</a>) è cambiato!<br/>Stato attuale della spedizione: <strong>Evaso</strong>', 1736625954, 0),
(40, 2, 'admin', 'Stato della Spedizione Cambiato!', 'Lo stato di un tuo ordine (<a href=\'order.html?id=44\'>clicca qui per vederlo</a>) è cambiato!<br/>Stato attuale della spedizione: <strong>Spedito</strong>', 1736631035, 0),
(41, 2, 'user', 'Nuovo Ordine', 'È stato effettuato un nuovo ordine!<br/>Sono stati ordinati 7 prodotti per un totale di 49.97 €.<br/><a href=\'order.html?id=45\'>Clicca qui per visualizzare tutti i dettagli dell\'ordine</a>', 1736709106, 0),
(42, 2, 'user', 'Recensione Aggiunta! (4 stelle)', 'L\'utente Jack (e-mail dell\'utente: <em>test@mail.com</em>) ha appena aggiunto una recensione ad un prodotto! (<a href=\'product.html?id=35\'>Visualizza il Prodotto Cliccando Qui</a>)<br/>L\'utente ha recensito il prodotto con <strong>4 stelle</strong> e mettendo come titolo <strong>Buon Drink</strong>', 1736709202, 0),
(43, 2, 'user', 'Recensione Aggiunta! (5 stelle)', 'L\'utente Jack (e-mail dell\'utente: <em>test@mail.com</em>) ha appena aggiunto una recensione ad un prodotto! (<a href=\'product.html?id=28\'>Visualizza il Prodotto Cliccando Qui</a>)<br/>L\'utente ha recensito il prodotto con <strong>5 stelle</strong> e mettendo come titolo <strong>Ottimo Astuccio</strong>', 1736709251, 0),
(44, 2, 'admin', 'Stato della Spedizione Cambiato!', 'Lo stato di un tuo ordine (<a href=\'order.html?id=45\'>clicca qui per vederlo</a>) è cambiato!<br/>Stato attuale della spedizione: <strong>Evaso</strong>', 1736709598, 0),
(45, 2, 'admin', 'Stato della Spedizione Cambiato!', 'Lo stato di un tuo ordine (<a href=\'order.html?id=44\'>clicca qui per vederlo</a>) è cambiato!<br/>Stato attuale della spedizione: <strong>In Consegna</strong>', 1736709605, 0),
(46, 3, 'user', 'Nuovo Ordine', 'È stato effettuato un nuovo ordine!<br/>Sono stati ordinati 3 prodotti per un totale di 231.29 €.<br/><a href=\'order.html?id=46\'>Clicca qui per visualizzare tutti i dettagli dell\'ordine</a>', 1736710502, 0),
(47, 3, 'admin', 'Stato della Spedizione Cambiato!', 'Lo stato di un tuo ordine (<a href=\'order.html?id=46\'>clicca qui per vederlo</a>) è cambiato!<br/>Stato attuale della spedizione: <strong>Evaso</strong>', 1736710594, 0),
(48, 3, 'admin', 'Stato della Spedizione Cambiato!', 'Lo stato di un tuo ordine (<a href=\'order.html?id=46\'>clicca qui per vederlo</a>) è cambiato!<br/>Stato attuale della spedizione: <strong>Spedito</strong>', 1736711747, 0),
(49, 3, 'user', 'Recensione Aggiunta! (3 stelle)', 'L\'utente User 2 (e-mail dell\'utente: <em>test2@mail.com</em>) ha appena aggiunto una recensione ad un prodotto! (<a href=\'product.html?id=39\'>Visualizza il Prodotto Cliccando Qui</a>)<br/>L\'utente ha recensito il prodotto con <strong>3 stelle</strong> e mettendo come titolo <strong>Cuffie medie</strong>', 1736716695, 0),
(50, 3, 'user', 'Recensione Aggiunta! (4 stelle)', 'L\'utente User 2 (e-mail dell\'utente: <em>test2@mail.com</em>) ha appena aggiunto una recensione ad un prodotto! (<a href=\'product.html?id=32\'>Visualizza il Prodotto Cliccando Qui</a>)<br/>L\'utente ha recensito il prodotto con <strong>4 stelle</strong> e mettendo come titolo <strong>Buon Tablet</strong>', 1736716881, 0),
(51, 3, 'user', 'Recensione Aggiunta! (5 stelle)', 'L\'utente User 2 (e-mail dell\'utente: <em>test2@mail.com</em>) ha appena aggiunto una recensione ad un prodotto! (<a href=\'product.html?id=34\'>Visualizza il Prodotto Cliccando Qui</a>)<br/>L\'utente ha recensito il prodotto con <strong>5 stelle</strong> e mettendo come titolo <strong>Ottima Custodia</strong>', 1736716927, 0),
(52, 2, 'admin', 'Stato della Spedizione Cambiato!', 'Lo stato di un tuo ordine (<a href=\'order.html?id=45\'>clicca qui per vederlo</a>) è cambiato!<br/>Stato attuale della spedizione: <strong>Spedito</strong>', 1736717507, 0),
(53, 2, 'admin', 'Stato della Spedizione Cambiato!', 'Lo stato di un tuo ordine (<a href=\'order.html?id=44\'>clicca qui per vederlo</a>) è cambiato!<br/>Stato attuale della spedizione: <strong>Consegnato</strong>', 1736717522, 0),
(54, 2, 'admin', 'Stato della Spedizione Cambiato!', 'Lo stato di un tuo ordine (<a href=\'order.html?id=45\'>clicca qui per vederlo</a>) è cambiato!<br/>Stato attuale della spedizione: <strong>In Consegna</strong>', 1736717536, 0),
(55, 3, 'user', 'Nuovo Ordine', 'È stato effettuato un nuovo ordine!<br/>Sono stati ordinati 2 prodotti per un totale di 33.97 €.<br/><a href=\'order.html?id=47\'>Clicca qui per visualizzare tutti i dettagli dell\'ordine</a>', 1736718513, 0),
(56, 3, 'user', 'Recensione Aggiunta! (3 stelle)', 'L\'utente User 2 (e-mail dell\'utente: <em>test2@mail.com</em>) ha appena aggiunto una recensione ad un prodotto! (<a href=\'product.html?id=28\'>Visualizza il Prodotto Cliccando Qui</a>)<br/>L\'utente ha recensito il prodotto con <strong>3 stelle</strong> e mettendo come titolo <strong>Classico astuccio</strong>', 1736718567, 0),
(57, 3, 'admin', 'Stato della Spedizione Cambiato!', 'Lo stato di un tuo ordine (<a href=\'order.html?id=47\'>clicca qui per vederlo</a>) è cambiato!<br/>Stato attuale della spedizione: <strong>Evaso</strong>', 1736718607, 0),
(58, 3, 'admin', 'Stato della Spedizione Cambiato!', 'Lo stato di un tuo ordine (<a href=\'order.html?id=47\'>clicca qui per vederlo</a>) è cambiato!<br/>Stato attuale della spedizione: <strong>Spedito</strong>', 1736718610, 0),
(59, 3, 'user', 'Recensione Aggiunta! (4 stelle)', 'L\'utente User 2 (e-mail dell\'utente: <em>test2@mail.com</em>) ha appena aggiunto una recensione ad un prodotto! (<a href=\'product.html?id=36\'>Visualizza il Prodotto Cliccando Qui</a>)<br/>L\'utente ha recensito il prodotto con <strong>4 stelle</strong> e mettendo come titolo <strong>Top prodotto</strong>', 1736718714, 0),
(60, 5, 'user', 'Nuovo Ordine', 'È stato effettuato un nuovo ordine!<br/>Sono stati ordinati 1 prodotto per un totale di 79.99 €.<br/><a href=\'order.html?id=48\'>Clicca qui per visualizzare tutti i dettagli dell\'ordine</a>', 1736718742, 0),
(61, 5, 'user', 'Recensione Aggiunta! (4 stelle)', 'L\'utente User 3 (e-mail dell\'utente: <em>test3@mail.com</em>) ha appena aggiunto una recensione ad un prodotto! (<a href=\'product.html?id=38\'>Visualizza il Prodotto Cliccando Qui</a>)<br/>L\'utente ha recensito il prodotto con <strong>4 stelle</strong> e mettendo come titolo <strong>Buon router</strong>', 1736718785, 0),
(62, 5, 'user', 'Nuovo Ordine', 'È stato effettuato un nuovo ordine!<br/>Sono stati ordinati 4 prodotti per un totale di 48.69 €.<br/><a href=\'order.html?id=49\'>Clicca qui per visualizzare tutti i dettagli dell\'ordine</a>', 1736718818, 1),
(63, 5, 'user', 'Recensione Aggiunta! (5 stelle)', 'L\'utente User 3 (e-mail dell\'utente: <em>test3@mail.com</em>) ha appena aggiunto una recensione ad un prodotto! (<a href=\'product.html?id=37\'>Visualizza il Prodotto Cliccando Qui</a>)<br/>L\'utente ha recensito il prodotto con <strong>5 stelle</strong> e mettendo come titolo <strong>Ottimo Prodotto</strong>', 1736718846, 1);

-- --------------------------------------------------------

--
-- Struttura della tabella `ordini`
--

CREATE TABLE `ordini` (
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `id_carta` bigint(20) UNSIGNED DEFAULT NULL,
  `n_prodotti` int(10) UNSIGNED NOT NULL,
  `costo_totale` float NOT NULL,
  `tipo_pagamento` enum('carta','contrassegno') NOT NULL,
  `stato_ordine` enum('Inserito','Evaso','Spedito','In Consegna','Consegnato') NOT NULL DEFAULT 'Inserito',
  `timestamp` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Dump dei dati per la tabella `ordini`
--

INSERT INTO `ordini` (`order_id`, `user_id`, `id_carta`, `n_prodotti`, `costo_totale`, `tipo_pagamento`, `stato_ordine`, `timestamp`) VALUES
(44, 2, 10, 1, 999.99, 'carta', 'Consegnato', 1736613417),
(45, 2, 12, 7, 49.97, 'carta', 'In Consegna', 1736709106),
(46, 3, NULL, 3, 231.29, 'contrassegno', 'Spedito', 1736710502),
(47, 3, NULL, 2, 33.97, 'contrassegno', 'Spedito', 1736718513),
(48, 5, NULL, 1, 79.99, 'contrassegno', 'Inserito', 1736718742),
(49, 5, NULL, 4, 48.69, 'contrassegno', 'Inserito', 1736718818);

-- --------------------------------------------------------

--
-- Struttura della tabella `prodotti`
--

CREATE TABLE `prodotti` (
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `nome` text NOT NULL,
  `descrizione` mediumtext NOT NULL,
  `prezzo` float NOT NULL,
  `quantita` int(10) UNSIGNED NOT NULL,
  `images` text NOT NULL DEFAULT '[]',
  `avg_rate` double NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Dump dei dati per la tabella `prodotti`
--

INSERT INTO `prodotti` (`product_id`, `nome`, `descrizione`, `prezzo`, `quantita`, `images`, `avg_rate`) VALUES
(26, 'Samsung Galaxy Tab S10', 'Scopri il Galaxy Tab S10, il tablet perfetto per chi cerca prestazioni elevate, un design elegante e una straordinaria esperienza multimediale. Equipaggiato con un potente processore octa-core e fino a 12 GB di RAM, il Galaxy Tab S10 garantisce fluidità e velocità in ogni attività, dalla navigazione web al multitasking più intenso.\r\n\r\nIl display AMOLED da 11 pollici con risoluzione QHD+ offre colori vividi e dettagli incredibili, rendendolo ideale per lo streaming di contenuti, il gaming e il lavoro creativo. La batteria a lunga durata da 10.000 mAh ti accompagna per tutta la giornata, con ricarica rapida per essere sempre pronto a ripartire!', 999.99, 147, '[\"5105a180417dfe47.png\",\"726df2b6183bc99a.png\"]', 5),
(27, 'Microsoft Surface Laptop', 'Copilot+ PC: Una nuova era AI. Il dispositivo Surface Laptop più veloce e intelligente di sempre.\r\nPrestazioni eccezionali: più veloce di MacBook Air M3[1] con una potenza senza confronti per favorire la tua produttività e creatività. La NPU ultraveloce consente di eseguire applicazioni basate sull\'AI.\r\nIl tuo assistente basato sull\'AI in versione accelerata: cerca ciò che ti serve con un linguaggio naturale e Recall lo troverà all\'istante, su qualsiasi piattaforma tu l\'abbia visto, inviato o salvato [2]\r\nMicrosoft Copilot: Diventa un creator in un solo clic! Premi il tasto Microsoft Copilot su Surface Laptop e trasforma le tue idee in realtà.\r\nUno schermo straordinario: particolarmente luminoso con tecnologia HDR potenziata, svela bianchi più nitidi, neri più scuri e uno spettro cromatico esteso.\r\nFotocamera Studio potenziata dall\'AI: le fotocamere HD anteriore e posteriore grazie all\'AI garantiscono una luminosità perfetta e suoni nitidi.\r\nElegante e intelligente: Realizzato con alluminio, materiale leggero e resistente, nei colori Platino e Nero', 1399, 75, '[\"d6ab384e6cbb193a.jpg\",\"7ae30fe2c6aa894c.jpg\",\"f58052a29dda4ed4.jpg\"]', 0),
(28, 'EASTPAK BENCHMARK SINGLE Astuccio', 'Ampio scomparto principale\r\nLogo del marchio\r\nFacile da trasportare\r\nAltezza: 6 cm, Larghezza: 20,5 cm, Profondità: 7,5 cm\r\nRealizzato in poliestere (100%) testurizzato\r\nTessuto idrorepellente', 12.99, 197, '[\"9159f12c484ec2cf.jpg\",\"9f6b72f1d9b1e29f.jpg\"]', 4),
(29, 'HP Borsa', 'COMPATIBILITÀ: la borsa Essential è adatta per i Notebook portatili fino a 15,6 pollici; la tasca ad accesso verticale può custodire i tuoi dispositivi non è mai stato così facile\r\nFUNZIONALITÀ: grazie alle diverse tasche interne ed esterne, richiudibili attraverso comode cerniere, la borsa funge da custodia e astuccio per i tuoi accessori e grazie alla tracolla removibile è facilmente attaccabile a un trolley, per viaggi in tutta comodità\r\nTASCHE: i molteplici vani, sia interni che esterni, consentono di organizzare tutto ciò di cui hai bisogno, dai documenti, alla borraccia, agli accessori tecnologici, in un\'unica pratica borsa\r\nMATERIALE: è realizzata interamente con materiali durevoli, che la rendona adattao all\'utilizzo quotidiano, dal tessuto resistente agli agenti atmosferici all\'imbottitura laterale e posteriore, dalla tracolla rimovibile alle robuste maniglie', 15.99, 148, '[\"a81505cd691410ee.jpg\",\"fe48b1e10296b5b5.jpg\"]', 0),
(30, 'HP Laptop 14s', 'SISTEMA OPERATIVO: Windows 11 Home Modalità S, ottimizzata per la sicurezza che consente l\'installazione delle app solo dal Microsoft Store e richiede Microsoft Edge per la navigazione sicura\r\nPROCESSORE: Intel Celeron N4500 ha una frequenza di basa fino a 2,8GHz, 4 MB di cache L3, 2 core e 2 thread, Chipset Integrated SoC\r\nMEMORIA: 4GB DDR4 di Ram da 2933mhz (1 x 4GB), integrata e non espandibile, per un avvio istantaneo è equipaggiato con un SSD SATA 3 M.2 da 128 GB\r\nSCHERMO: Display da 14\" con risoluzione Full HD da 1920 x 1080p, diagonale da 35,6 cm, Antiriflesso, SVA, Slim, Micro-Edge, Luminosità di 250 Nits, volume colore 45% NTSC\r\nAUTONOMIA: durata fino a 7 ore e 30 min, utile per chi lavora in mobilità senza interruzioni; con la Ricarica Rapida (HP Fast Charge) si potrà caricare in soli 45 min circa il 50% della batteria', 229.99, 100, '[\"48011bea049b0a9a.jpg\",\"2568000e2e96ca47.jpg\",\"dce1d7da1c0f0bb1.jpg\"]', 0),
(31, 'HP 250 G9', 'Marca: HP\r\nHP 250 G9 Computer portatile 39,6 cm (15.6\") 1366 x 768 Pixel Intel N4500 8 GB DDR4-SDRAM 256 GB SSD Wi-Fi Windows 11 Pro\r\nTipo di prodotto: NOTEBOOK_COMPUTER\r\nColore: Nero', 279.5, 70, '[\"3d23267842278e9e.jpg\"]', 0),
(32, 'Samsung Galaxy Tab A9+', 'Stile moderno, display raffinato: Samsung Galaxy Tab A9+ presenta un elegante corpo in metallo, Graphite o Navy; è dotato di display ampio e brillante per un intrattenimento coinvolgente, in tutte le condizioni di luce\r\nRiempi i tuoi spazi con un audio dinamico di qualità: lasciati coinvolgere dai suoni immersivi degli altoparlanti di Galaxy Tab A9+, e ascolta musica e film con chiarezza e profondità strabilianti\r\nConserva tutto ciò che ami: il tablet Samsung Galaxy Tab A9+ offre fino a 8GB di RAM per ottimizzare le prestazioni durante il multitasking e una capacità di archiviazione di 128 GB (ampliabile fino a 1TB); salva tutti i tuoi file in alta risoluzione, conserva di più ed elimina di meno', 199, 119, '[\"415cf06b69fcabc4.jpg\",\"2a37a67ceb3d4fab.jpg\",\"3ba4856d4980092e.jpg\",\"a2c8e2793368f875.jpg\"]', 4),
(33, 'JUSYEA 2024 Newest Tablet', '【L\'ultimo Sistema Android 13 e Processori 2.0Ghz】Il tablet J10 è dotato dell\'ultimo sistema operativo Android 13. Il nuovo sistema rafforza la privacy e la protezione dei dati, rendendola più veloce e sicura. Android 13 ti offre impostazioni più personalizzate (Widget, Schermo Diviso, Controllo Parentale e Utenti Multipli, ecc.). Il tablet è dotato di un potente processori da 2,0 Ghz, che offre un\'esperienza fluida e sicura per l\'utilizzo del sistema e lo streaming multimediale\r\n【12GB di RAM + 128GB di ROM + 1TB Espandibile】Il tablet J10 è dotato di 12GB di RAM (6GB di RAM + 6GB di RAM di espansione) e 128GB di ROM, che supporta l\'espansione massima della memoria da 1TB (tramite scheda MicroSD/TF) e questa memoria può essere configurata come memoria aggiuntiva/memoria portatile. I tablet offrono ampio spazio per eseguire app o archiviare immagini, film, documenti e libri\r\n【Doppio Wi-Fi e Bluetooth 5.0】Il tablet supporta Wi-Fi a 2,4 Ghz e 5 Ghz, un nuovo canale di ricezione e trasmissione Wi-Fi, che migliora la velocità e la stabilità della connessione di rete. Play Store è preinstallato e varie applicazioni possono essere scaricate dal Play Store. Il tablet ha una funzione Bluetooth 5.0 integrata più stabile e veloce, che può collegare auricolari Bluetooth, tastiere Bluetooth e altri dispositivi Bluetooth tramite Bluetooth 5.0', 89.99, 8, '[\"fb33e95cb067618d.jpg\",\"19e9009b6acea19d.jpg\",\"006712bf4080896a.jpg\",\"ca60feb1a42ce2c4.jpg\",\"761087e1e03e7b6c.jpg\",\"9ea5e9a4353e270d.jpg\"]', 0),
(34, 'Borsa per Tablet', 'Capacità estesa del 30% della borsa per tablet: funzione estesa speciale, se necessario, aprire la cerniera laterale, può essere estesa del 30% di spazio!\r\nMATERIALE DI ALTA QUALITÀ: l\'esterno di questa borsa per laptop è realizzato in oxford impermeabile di alta qualità, spugna traspirante e morbida con un alto cuscino interno e offre una protezione a 360 ° per il tuo laptop e vari dispositivi.\r\nTracolla rimovibile, può essere utilizzata come borsa a tracolla o supporto per borsetta secondo necessità.', 12.79, 19, '[\"726a5e028cb88cb2.jpg\"]', 5),
(35, 'Red Bull Energy Drink', 'La mattina non riesci proprio ad attivarti o vuoi un boost di concentrazione prima di un esame.\r\nPuoi sempre ricorrere a RedBull, mette le ali...', 2, 246, '[\"8d8076ae06473137.jpg\",\"ddae4e165a79f8bf.jpg\",\"c7032ff18be22fb6.jpg\"]', 4),
(36, 'Pozione Sonno Istantaneo', 'Rilassati e concediti un sonno profondo con la Pozione del Riposo Istanteo! Questa magica miscela è stata accuratamente preparata per aiutarti ad addormentarti velocemente e risvegliarti completamente riposato. Con un delicato bagliore e un aroma rilassante, è perfetta per chiunque cerchi un rimedio naturale per combattere l\'insonnia o le notti agitate.\r\n\r\nCaratteristiche principali:\r\n\r\nEffetto rapido: Agisce in pochi istanti per un sonno profondo.\r\nNaturale: Realizzata con ingredienti magici di origine naturale.\r\nFacile da usare: Basta un piccolo sorso per sentirne l\'effetto.\r\nNota: Utilizzare con moderazione. Non adatta a minori di 16 anni o a persone con allergie specifiche agli ingredienti magici. Sogni d\'oro garantiti! 🌙', 20.98, 29, '[\"bb8461a6aabbf0a4.jpg\",\"23ef63b8cce07e45.webp\"]', 4),
(37, 'Fabriano F4', 'Storici e di alta qualità fogli da disegno Fabriano F4', 10.9, 22, '[\"280c153c97c59c9c.jpg\"]', 5),
(38, 'TP-Link Archer AX55 Router WiFi 6', 'Il TP-Link Archer AX55 è un router WiFi 6 ad alte prestazioni, ideale per migliorare la velocità e la stabilità della tua connessione internet domestica. Con una velocità combinata fino a 3 Gbps, supporta streaming 4K, gaming online senza interruzioni e download rapidi. Grazie alla tecnologia OFDMA e MU-MIMO, garantisce una connessione fluida anche in presenza di più dispositivi connessi. Il router offre una copertura estesa con antenne ad alte prestazioni e una CPU avanzata per gestire traffico intenso. Include funzioni di sicurezza avanzate con TP-Link HomeShield per proteggere i tuoi dispositivi e la tua rete. Configurabile facilmente tramite l\'app Tether, è la scelta perfetta per chi cerca affidabilità, velocità e sicurezza in un unico dispositivo.', 79.99, 8, '[\"303cd5d9d43a6871.jpg\",\"251b06c950fb4717.jpg\",\"11ede2520025be76.jpg\"]', 4),
(39, 'Auricolari Bluetooth 5.3 Wireless', 'Suono Hi-Fi e 5-7 h per tre volte di Riproduzione: Con driver da 13mm, queste cuffie Bluetooth danno alti chiari e bassi profondi. Grazie alla tecnologia CVC, riducono l\'85% del rumore. 21 ore di prestazioni costanti in viaggio, lavoro o relax.\r\nDesign Ergonomico e Leggero: Con 3 dimensioni di tappi in silicone morbido, queste auricolari bluetooth offrono una calzata personalizzata. Pesando solo 3,8g, garantiscono comfort per un uso prolungato. Realizzati con nanomateriali ultraleggeri, le cuffiette Bluetooth resistono al sudore e alla pioggia, ideali per l\'uso quotidiano come camminare, correre e fare esercizio.\r\nConnessione Bluetooth 5.3 Stabile e Accoppiamento Automatico: Grazie all\'ultima tecnologia Bluetooth 5.3, queste cuffie wireless offrono una connessione stabile e una trasmissione rapida fino a 15 metri di distanza. Basta aprire la custodia di ricarica, estrarre le cuffie e si sincronizzeranno subito con il tuo dispositivo.', 19.5, 14, '[\"14ed7eeaa45b082c.jpg\",\"d8f0dcf43e26129d.jpg\",\"083fcec90b9b4155.jpg\"]', 3);

-- --------------------------------------------------------

--
-- Struttura della tabella `prodotti_carrello`
--

CREATE TABLE `prodotti_carrello` (
  `cart_prod_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `quantita` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Dump dei dati per la tabella `prodotti_carrello`
--

INSERT INTO `prodotti_carrello` (`cart_prod_id`, `user_id`, `product_id`, `quantita`) VALUES
(94, 2, 29, 1),
(95, 2, 35, 8);

-- --------------------------------------------------------

--
-- Struttura della tabella `prodotti_ordine`
--

CREATE TABLE `prodotti_ordine` (
  `abs_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED DEFAULT NULL,
  `prezzo_unitario` float NOT NULL,
  `quantita` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Dump dei dati per la tabella `prodotti_ordine`
--

INSERT INTO `prodotti_ordine` (`abs_id`, `user_id`, `order_id`, `product_id`, `prezzo_unitario`, `quantita`) VALUES
(92, 2, 44, 26, 999.99, 1),
(93, 2, 45, 28, 12.99, 2),
(94, 2, 45, 29, 15.99, 1),
(95, 2, 45, 35, 2, 4),
(96, 3, 46, 32, 199, 1),
(97, 3, 46, 34, 12.79, 1),
(98, 3, 46, 39, 19.5, 1),
(99, 3, 47, 28, 12.99, 1),
(100, 3, 47, 36, 20.98, 1),
(101, 5, 48, 38, 79.99, 1),
(102, 5, 49, 29, 15.99, 1),
(103, 5, 49, 37, 10.9, 3);

-- --------------------------------------------------------

--
-- Struttura della tabella `recensioni`
--

CREATE TABLE `recensioni` (
  `review_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `stars` tinyint(1) NOT NULL,
  `titolo` text NOT NULL,
  `testo` mediumtext NOT NULL,
  `timestamp` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Dump dei dati per la tabella `recensioni`
--

INSERT INTO `recensioni` (`review_id`, `user_id`, `product_id`, `stars`, `titolo`, `testo`, `timestamp`) VALUES
(8, 2, 26, 5, 'Buon Tablet', 'Buon prodotto, grafica molto dettagliata e batteria davvero di lunga durata, anche a caricarsi è abbastanza veloce.', 1736617261),
(9, 2, 35, 4, 'Buon Drink', 'Beh classica Red Bull, buona ma preferisco la Monster', 1736709202),
(10, 2, 28, 5, 'Ottimo Astuccio', 'Buon astuccio Eastpack di ottima fattura, come molti prodotti della stessa marca.', 1736709250),
(11, 3, 39, 3, 'Cuffie medie', 'Cuffie di media qualità ma comunque abbastanza buone considerando il prezzo.', 1736716694),
(12, 3, 32, 4, 'Buon Tablet', 'Buon tablet, ha molta memoria e si ricarica velocemente. La batteria si scarica un po\' troppo velocemente ma comunque un giorno con utilizzo intenso lo regge.', 1736716881),
(13, 3, 34, 5, 'Ottima Custodia', 'Custodia perfetta!\nDi ottima fattura e prezzo TOP!', 1736716927),
(14, 3, 28, 3, 'Classico astuccio', 'Astuccio classico, potrebbe essere leggermente più grande', 1736718566),
(15, 3, 36, 4, 'Top prodotto', 'Riduce di molto il tempo per addormentarsi e migliora un po\' la qualità del sogno.', 1736718713),
(16, 5, 38, 4, 'Buon router', 'Router abbastanza buono, Wi-Fi 6 la connessione è abbastanza veloce e stabile, buon prezzo', 1736718785),
(17, 5, 37, 5, 'Ottimo Prodotto', 'Storici fogli da disegno Fabriano, sempre di ottima qualità!', 1736718846);

-- --------------------------------------------------------

--
-- Struttura della tabella `utenti`
--

CREATE TABLE `utenti` (
  `user_id` int(10) UNSIGNED NOT NULL,
  `nome` text NOT NULL,
  `email` text NOT NULL,
  `password` text NOT NULL,
  `tipo` enum('user','admin') NOT NULL DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Dump dei dati per la tabella `utenti`
--

INSERT INTO `utenti` (`user_id`, `nome`, `email`, `password`, `tipo`) VALUES
(1, 'Venditore', 'giacomo.casadei16@studio.unibo.it', '$2y$10$XQZ/8Y43SuJGawunULxaNOUCCNystUlwr2rbvKzGAZvus0ZvaT/HS', 'admin'),
(2, 'Jack', 'test@mail.com', '$2y$10$nQzKPEtgw3pnDAJLilkpkuL.5Ud2GhYEKOfdfKrFb7gPK0RtXCuKK', 'user'),
(3, 'User 2', 'test2@mail.com', '$2a$12$DUXgQIk24QOLbY2moANlDO0idQc63.oN8jcxdvZm4LE55cjEx.DgK', 'user'),
(5, 'User 3', 'test3@mail.com', '$2y$12$wwvBkV.ju5/s3YLGjP70FOuSTpFNcYa11O5bqqb3Z60mPzpMxJW96', 'user'),
(7, 'User 4', 'test4@mail.com', '$2y$12$8Iw70cWgFHAmiLr4oCr5SuOeFTq9M8hEGtizyHd46PGuvL5fmS.Wa', 'user');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `carte`
--
ALTER TABLE `carte`
  ADD PRIMARY KEY (`id_carta`),
  ADD KEY `user_id` (`user_id`);

--
-- Indici per le tabelle `notifiche`
--
ALTER TABLE `notifiche`
  ADD PRIMARY KEY (`notify_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indici per le tabelle `ordini`
--
ALTER TABLE `ordini`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `id_carta` (`id_carta`);

--
-- Indici per le tabelle `prodotti`
--
ALTER TABLE `prodotti`
  ADD PRIMARY KEY (`product_id`);

--
-- Indici per le tabelle `prodotti_carrello`
--
ALTER TABLE `prodotti_carrello`
  ADD PRIMARY KEY (`cart_prod_id`),
  ADD UNIQUE KEY `unique_user_product` (`user_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indici per le tabelle `prodotti_ordine`
--
ALTER TABLE `prodotti_ordine`
  ADD PRIMARY KEY (`abs_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indici per le tabelle `recensioni`
--
ALTER TABLE `recensioni`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indici per le tabelle `utenti`
--
ALTER TABLE `utenti`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `carte`
--
ALTER TABLE `carte`
  MODIFY `id_carta` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT per la tabella `notifiche`
--
ALTER TABLE `notifiche`
  MODIFY `notify_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT per la tabella `ordini`
--
ALTER TABLE `ordini`
  MODIFY `order_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT per la tabella `prodotti`
--
ALTER TABLE `prodotti`
  MODIFY `product_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT per la tabella `prodotti_carrello`
--
ALTER TABLE `prodotti_carrello`
  MODIFY `cart_prod_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=103;

--
-- AUTO_INCREMENT per la tabella `prodotti_ordine`
--
ALTER TABLE `prodotti_ordine`
  MODIFY `abs_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=104;

--
-- AUTO_INCREMENT per la tabella `recensioni`
--
ALTER TABLE `recensioni`
  MODIFY `review_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT per la tabella `utenti`
--
ALTER TABLE `utenti`
  MODIFY `user_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `carte`
--
ALTER TABLE `carte`
  ADD CONSTRAINT `carte_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `utenti` (`user_id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `notifiche`
--
ALTER TABLE `notifiche`
  ADD CONSTRAINT `notifiche_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `utenti` (`user_id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `ordini`
--
ALTER TABLE `ordini`
  ADD CONSTRAINT `ordini_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `utenti` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `ordini_ibfk_2` FOREIGN KEY (`id_carta`) REFERENCES `carte` (`id_carta`) ON DELETE SET NULL;

--
-- Limiti per la tabella `prodotti_carrello`
--
ALTER TABLE `prodotti_carrello`
  ADD CONSTRAINT `prodotti_carrello_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `prodotti` (`product_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `prodotti_carrello_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `utenti` (`user_id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `prodotti_ordine`
--
ALTER TABLE `prodotti_ordine`
  ADD CONSTRAINT `prodotti_ordine_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `ordini` (`order_id`),
  ADD CONSTRAINT `prodotti_ordine_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `prodotti` (`product_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `prodotti_ordine_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `utenti` (`user_id`) ON DELETE SET NULL;

--
-- Limiti per la tabella `recensioni`
--
ALTER TABLE `recensioni`
  ADD CONSTRAINT `recensioni_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `prodotti` (`product_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `recensioni_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `utenti` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
