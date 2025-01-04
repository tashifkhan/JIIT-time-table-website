const mapping = {
    1: {
        "timetable": {
            "MON": {
                "9-9.50": [
                    "LB3,B4(PH211)-FF7/VRT",
                    "LB11,B12(B11HS111)-CS8/GA",
                    "LB7,B8(PH211)- CR425/RAV",
                    "LC1,C2,C3(B11HS111)-FF3/VGU",
                    "LB5,B6(MA211)- FF4/RSC",
                    "TA7(MA211)-TS6/AN",
                    "TA8(MA211)-TS7/NS",
                    "PA15(CI271)-CL01 /APR,NIY,SAA",
                    "PA16(CI271)- CL02/BS,ANP,DCH",
                    "PB1 (HS111)- LL/HK",
                    "PB2 (HS111)- CL12/EKS",
                    "PA1(GE111)- CAD1/ SNP",
                    "PA2(GE111)- CAD2/ GGL",
                    "PA17(GE111)- CAD3/ SWET"
                ],
                "10-10.50": [
                    "LA5,A6(MA211)- G1/YG",
                    "LA7,A8(PH211)-G2/MTR",
                    "LA10,B14(CI121)- G3/DEP",
                    "LG1,G2(CI121)-FF1/APJ",
                    "LB3,B4(CI121)-FF2/AMT",
                    "TB5(B11HS111)-TS6/BB",
                    "TB6(B11HS111)-TS7/AMN",
                    "TA18(MA211)-TS8/HA",
                    "TB9(PH211)-TS11/INC",
                    "TB10(PH211)-TS12/GPK",
                    "PA4(PH271)- PL1/ABH",
                    "PA3(PH271)- PL2/AP/RKD"
                ],
                "11-11.50": [
                    "LA5.A6(CI121)- G1/DSR",
                    "LA7,A8(CI121)- G2/SMT",
                    "LA10,B14(MA211)- G3/AN",
                    "LG1,G2(PH211)-FF1/DIN",
                    "LA15,A16(PH211)-FF2/SDC",
                    "LB7,B8(B11HS111)-G6/BCJ",
                    "TB1(B11HS111)-TS7/IJ",
                    "TB5(PH211)-TS8/NKS",
                    "TB6(PH211)-TS10/MKC",
                    "TB10(MA211)-TS11/MPA",
                    "TC1(MA212)-TS6/RSH"
                ],
                "12-12.50": [
                    "LUNCH"
                ],
                "1-1.50": [
                    "LA3,A4(CI121)- G1/SOS",
                    "LC1,C2,C3(MA212)- G2/RSH",
                    "LB5,B6(PH211)-G3/ABH",
                    "LA1,A2(CI121)-FF1/AJS",
                    "LA10,B14(PH211)-FF2/NG",
                    "LB1,B2(MA211)-G5 /GA",
                    "TB3(B11HS111)-TS6/IJ",
                    "PB11(PH271)- PL1/RAV/BCJ",
                    "PB12(PH271)- PL2/ANU/MTR",
                    "PA15(HS111)- LL/MRB",
                    "PA16 (HS111)- CL12/ KMB",
                    "PA5(GE111)- CAD1/ SWET",
                    "PA6(GE111)- CAD2/ NKR",
                    "PA18(GE111)- CAD3/ CDN"
                ],
                "2-2.50": [
                    "LB1,B2(B11HS111)-G1/PRV",
                    "LB9,B10(PH211)-G2/SND",
                    "LA1,A2(MA211)-FF1/MPA",
                    "LB3,B4(B11HS111)-FF2/SHB",
                    "TB7(B11HS111)-TS6/VSE",
                    "TA3(MA211)-TS7/AN",
                    "PA10(CI271)-CL01 /DCH,AJP,BS,SUD",
                    "PB14(CI271)- CL02/KM,SAA,DSI",
                    "PC3(B15BT111)- BT3/EKT, PMG,SHD,AKT"
                ],
                "3-3.50": [
                    "LB1,B2(PH211)-G1/MKC",
                    "LB9,B10(MA211)-G2/HPT",
                    "LB11,B12(CI121)- G3/NEH",
                    "LA15,A16(MA211)- FF1/NSK",
                    "TB5(MA211)-TS6/RSC",
                    "TA4(MA211)-TS7/PSI",
                    "TG1(PH211)-TS11/ABH",
                    "TG2(PH211)-TS12/RKG",
                    "PA1(CI271)-CL05 /MGR.SOS,SLK,MAY",
                    "PA2(CI271)-CL06 /GZL,HN,PSO",
                    "PC1 (HS111)- LL/YN",
                    "PC2 (HS111)- CL12/ NES",
                    "PB3(PH271)- PL1/SDC",
                    "PB4(PH271)- PL2/SPP/GPK"
                ],
                "4-4.50": [
                    "LA10,B14(B11HS111)-G1/IC",
                    "LA15,A16(CI121)- FF1/TAJ",
                    "TA17(CI121)-TS6/SMT",
                    "TA18(CI121)-TS7/AM",
                    "TG1(CI121)-TS8/DSR",
                    "TG2(CI121)-TS10/APJ",
                    "TC3(B11CI121)-TS11/SJA"
                ],
                "NaN": []
            },
            "TUE": {
                "9-9.50": [
                    "LC1,C2,C3(B11CI121)- G1/SJA",
                    "LA5,A6(PH211)-FF8/GPK",
                    "LB9,B10(MA211)-FF9/HPT",
                    "LA7,A8(B11HS111)-FF3/SGL",
                    "LB5,B6(CI121)-FF4/SUD",
                    "TG1(MA211)-TS6/PAT",
                    "TB14(B11HS111)-TS7/BB",
                    "TA1(B11HS111)-TS8/AMN",
                    "TA2(B11HS111)-TS11/IJ",
                    "TA3(B11HS111)-TS10/VSE",
                    "PB11(CI271)-CL05 /NIY,AMT,DSI",
                    "PB12(CI271)-CL06 /ASK,KP,NSA",
                    "PB3 (HS111)-LL / KMB",
                    "PB4 (HS111)- CL12/ NES",
                    "PA4(GE111)- CAD1/ SNP",
                    "PA15(GE111)- CAD2/ CDN",
                    "PA16(GE111)- CAD3/ NKR"
                ],
                "10-10.50": [
                    "LC1,C2,C3(B11HS111)-G1/VGU",
                    "LB1,B2(MA211)- G2/GA",
                    "LB9,B10(B11HS111)-G3/SDA",
                    "LB7,B8(CI121)- FF1/AM",
                    "LB5,B6(B11HS111)-FF2/PU",
                    "TA5(B11HS111)-TS6/PRI",
                    "TA6(B11HS111)-TS7/BB",
                    "TA2(PH211)-TS11/SND",
                    "TA1(PH211)-TS12/ABH",
                    "PA8(PH271)-PL2 /AP/RKG",
                    "PA7(PH271)- PL1/MKC"
                ],
                "11-11.50": [
                    "LA10,B14(CI121)- G1/DEP",
                    "LB3,B4(PH211)-G2/VRT",
                    "LG1,G2(MA211)-G3 /AT",
                    "LB7,B8(MA211)- FF1/RSC",
                    "LB11,B12(PH211)-FF2/RKD",
                    "LA1,A2(B11HS111)-FF4/NEJ",
                    "TC2(MA212)-TS6/AKK",
                    "TB1(CI121)-TS7/APJ",
                    "TB2(CI121)-TS8/AJS"
                ],
                "12-12.50": [
                    "LUNCH"
                ],
                "1-1.50": [
                    "LA3,A4(CI121)- G1/SOS",
                    "LC1,C2,C3(MA212)-G2 /RSH",
                    "LB3,B4(MA211)- G3/PAT",
                    "LB7,B8(PH211)-FF1/RAV",
                    "LA17,A18(MA211)- G5/AKK",
                    "TA1(MA211)-TS6/AKK",
                    "TA10(MA211)-TS7/BPC",
                    "PB11 (HS111)- LL/ PSH",
                    "PA7 (HS111)- CL12/ NAM",
                    "PB1(PH271)- PL1/PC/NKS",
                    "PB2(PH271)- PL2/RKD/NG",
                    "PB10(GE111)- CAD1/ SNP",
                    "PG1(GE111)- CAD2/ GGL",
                    "PG2(GE111)- CAD3/ CDN"
                ],
                "2-2.50": [
                    "LA3,A4(MA211)- G1/BPC",
                    "LB5,B6(PH211)-G2/ABH",
                    "LB3,B4(CI121)-G3/AMT",
                    "LB7,B8(B11HS111)-FF1/BCJ",
                    "LA15,A16(MA211)- FF2/NSK",
                    "LA5,A6(B11HS111)-FF4/MKB",
                    "TB12(PH211)-TS12/MTR",
                    "TC1(PH212)-TS6/RKG",
                    "TB14(MA211)-TS7/AN",
                    "TA17(MA211)-TS8/MPA"
                ],
                "3-3.50": [
                    "LA15,A16(CI121)- G1/TAJ",
                    "LA3,A4(PH211)-G2/MKC",
                    "LA7,A8(CI121)-G3 /SMT",
                    "LB5,B6(MA211)-FF1/RSC",
                    "LA17,A18(B11HS111)-FF2/VRT",
                    "TA6(PH211)-TS11/INC",
                    "TB11(CI121)-TS6/SHP",
                    "TB9(MA211)-TS8/AKK",
                    "TA5(MA211)-TS10/YG",
                    "PB7(CI271)-CL21 /APR,MSH,SOS,AM",
                    "PB8(CI271)-CL23 /HN,SLK,PSO",
                    "PA10(PH271)- PL1/SPP/SND",
                    "PC3 (HS111)-LL / EKS",
                    "PB12 (HS111)- CL12/ MDU"
                ],
                "4-4.50": [
                    "LA15,16(PH211)-G1/SDC",
                    "LG1,G2(CI121)-FF1/APJ",
                    "LB9,B10(CI121)- G3/MEE",
                    "TB6(CI121)-TS7/AMT",
                    "TA17(PH211)-TS11/RKG",
                    "TA7(B11HS111)-TS12/PRI",
                    "TA8(B11HS111)-TS10/BB",
                    "TB5(CI121)-TS6/SMT"
                ],
                "NaN": []
            },
            "WED": {
                "9-9.50": [
                    "LB7,B8(CI121)-G1/AM",
                    "LA17,A18(PH211)-G2/INC",
                    "LA10,B14(B11HS111)-G3/IC",
                    "LA15,A16(B11HS111)-FF4/SHS",
                    "LB11,B12(B11HS111)-FF8/GA",
                    "TA4(B11HS111)-TS6/PRI",
                    "TA2(MA211)-TS7/PAT",
                    "PA7(CI271)-CL01 /SHP,AJP,SMT",
                    "PA8(CI271)-CL05 /ANP,BS,SYN",
                    "PA5 (HS111)- LL/ MRB",
                    "PA6 (HS111)- CL12/ PSH",
                    "PC1(GE111)- CAD1/ NKR",
                    "PC2(GE111)- CAD2/ GGL",
                    "PB9(GE111)- CAD3/ SWET"
                ],
                "10-10.50": [
                    "LA3,A4(MA211)- G1/BPC",
                    "LA17,A18(CI121)-G2/SLK",
                    "LA15,A16(PH211)-G3/SDC",
                    "LB3,B4(CI121)-FF1 /AMT",
                    "LG1,G2(B11HS111)-FF2/SDA",
                    "TB11(MA211)-TS6/SG",
                    "TA10(PH211)-TS11/DIN",
                    "TB2(B11HS111)-TS12/BB",
                    "PB7(PH271)- PL1/BCJ",
                    "PB8(PH271)- PL2/GPK"
                ],
                "11-11.50": [
                    "LA3,A4(PH211)-G1/MKC",
                    "LA17,A18(B11HS111)-G2/VRT",
                    "LB11,B12(MA211)- G3/NS",
                    "LG1,G2(MA211)-FF1/AT",
                    "LA7,A8(CI121)-FF2/SMT",
                    "LA1,A2(B11HS111)-FF4/NEJ",
                    "TB1(PH211)-TS11/RKD",
                    "TB2(PH211)-TS12/SND",
                    "TB10(B11HS111)-TS7/VSE",
                    "TA5(CI121)-TS6/AJS",
                    "TA6(CI121)-TS8/TAJ",
                    "TB3(CI121)-TS10/MEE"
                ],
                "12-12.50": [
                    "LUNCH"
                ],
                "1-1.50": [
                    "LA3,A4(CI121)- G1/SOS",
                    "LC1,C2,C3(B11CI121)- G2/SJA",
                    "LA7,A8(PH211)-G3/MTR",
                    "LB5,B6(MA211)-FF1/RSC",
                    "LB9,B10(B11HS111)-FF2/SDA",
                    "TB7(MA211)-TS10/BPC",
                    "TB4(PH211)-TS11/DIN",
                    "LB11,B12(CI121)- G4/NEH",
                    "PB14(PH271)- PL1/VRT/PC",
                    "PG1 (HS111)- LL/ KMB",
                    "PG2 (HS111)-CL12 / MRB"
                ],
                "2-2.50": [
                    "LA5,A6(PH211)-G1/GPK",
                    "LA15,A16(MA211)- G3/NSK",
                    "LB7, B8(PH211)-FF1/RAV",
                    "LB3,B4(MA211)- FF2/PAT",
                    "LA3,A4(B11HS111)- FF4/CKJ",
                    "TA7(PH211)-TS11/INC",
                    "TC2(PH212)-TS6/RKG",
                    "TA10(B11HS111)-TS7/IJ",
                    "TB9(B11HS111)-TS8/AMN",
                    "TB12(CI121)-TS10/SUD",
                    "PC3(CI121)- CL01/SJA,PKU,SON",
                    "PB11(GE111)- CAD1/ SNP",
                    "PB5(GE111)- CAD2/ GGL",
                    "PB6(GE111)- CAD3/ CDN"
                ],
                "3-3.50": [
                    "LB9,B10(PH211)-G1/SND",
                    "LA10,B14(PH211)-G2/NG",
                    "LB1,B2(MA211)- G3/GA",
                    "LG1,G2(PH211)-FF1/DIN",
                    "TB12(MA211)-TS6/NS",
                    "TB7(CI121)-TS7/SOS",
                    "TB8(CI121)-TS8/AMT",
                    "PA3(CI271)- CL21/MEE,MSH,MSI,DCH",
                    "PA4(CI271)-CL22 /MGR,SLK,ASY",
                    "PA15(PH271)- PL1/RKG",
                    "PA16(PH271)- PL2/RKD",
                    "PA17 (HS111)-LL / EKS",
                    "PA18 (HS111)- CL12/MDU",
                    "PB3(CI271)-CL02/HN,TAJ,AA",
                    "PB4(CI271)-CL03 /AM,DSR,APJ"
                ],
                "4-4.50": [
                    "LB1,B2(CI121)- G1/PSO",
                    "LC1,C2,C3(PH212)-FF2/SPP",
                    "TB7(PH211)-TS11/ABH",
                    "TB8(PH211)-TS12/NAR"
                ],
                "NaN": []
            },
            "THU": {
                "9-9.50": [
                    "LB5,B6(PH211)-G1/ABH",
                    "LA5,A6(PH211)-G2/GPK",
                    "LA17,A18(CI121)-G3/SLK",
                    "LB3,B4(MA211)-G6/PAT",
                    "LG1,G2(PH211)-G7/DIN",
                    "PB10(CI271)- CL01/SHP,NIY,SMT",
                    "PB9(CI271)- CL05/KP,SYN,MEE,MAY",
                    "PA1 (HS111)- LL/ NAM",
                    "PA2(HS111)- CL12/ MRB",
                    "PB7(GE111)- CAD1/ SWET",
                    "PB8(GE111)- CAD2/ CDN"
                ],
                "10-10.50": [
                    "LA5,A6(CI121)- G2/DSR",
                    "LA7,A8(PH211)-G3/MTR",
                    "LB11,B12(PH211)-FF1/RKD",
                    "LG1,G2(CI121)- FF2/APJ",
                    "TB1(MA211)-TS6/BPC",
                    "TB4(B11HS111)-TS7/AMN",
                    "TA10(CI121)-TS8/SOS",
                    "TB14(CI121)-TS10/NEH",
                    "PB6(PH271)- PL1/PC",
                    "PB5(PH271)- PL2/MKC/NKS",
                    "PC2(CI121)- CL06/ALK,PK,PKU"
                ],
                "11-11.50": [
                    "LA17,A18(PH211)-G1/INC",
                    "LA5,A6(MA211)-G2 /YG",
                    "LA10,B14(MA211)- G3/AN",
                    "LB9,B10(CI121)- FF1/MEE",
                    "LG1,G2(MA211)- FF2/AT",
                    "LA1,A2(CI121)-FF4/AJS",
                    "TC3(PH212)-TS6/RKG",
                    "TB2(MA211)-TS10/SG",
                    "TA8(PH211)-TS11/GPK",
                    "TA15(B11HS111)-TS7/IJ",
                    "TA16(B11HS111)-TS8/VSE"
                ],
                "12-12.50": [
                    "LUNCH"
                ],
                "1-1.50": [
                    "LA7,A8(MA211)- G1/HPT",
                    "LC1,C2,C3(MA212)- G2/RSH",
                    "LA1,A2(PH211)-G3/RKG",
                    "LA3,A4(B11HS111)-FF1/CKJ",
                    "LG1,G2(B11HS111)-/SDA",
                    "TB11(B11HS111)-TS7/AMN",
                    "TB12(B11HS111)-TS8/VSE",
                    "TB9(CI121)-TS10/DSR",
                    "TB10(CI121)-TS11/SOS",
                    "TB6(MA211)-TS12/PSI",
                    "PA18(PH271)- PL1/INC",
                    "PA17(PH271)- PL2/NKS",
                    "PB7 (HS111)-LL / NAM",
                    "PB8 (HS111)- CL12/ KMB",
                    "PB1(GE111)- CAD1/ NKR",
                    "PB2(GE111)- CAD2/ GGL"
                ],
                "2-2.50": [
                    "LB9,B10(PH211)-G1/SND",
                    "LA1,A2(MA211)- G3/MPA",
                    "LA3,A4(B11HS111)-FF1/CKJ",
                    "LB11,B12(MA211)-FF2 /NS",
                    "TG2(MA211)-TS6/PAT",
                    "TC1(B11CI121)-TS7/SJA"
                ],
                "3-3.50": [
                    "LA3,A4(MA211)- G1/BPC",
                    "LB3,B4(B11HS111)-G2/SHB",
                    "LB7,B8(MA211)- G3/RSC",
                    "LB5,B6(CI121)- FF1/SUD",
                    "TC3(MA212)-TS6/AKK",
                    "TA7(CI121)-TS7/SHP",
                    "TA8(CI121)-TS8/MEE",
                    "TA17(B11HS111)-TS10/IJ",
                    "TA18(B11HS111)-TS11/VSE",
                    "PB9(PH271)- PL1/NG/SDC",
                    "PB10(PH271)- PL2/SND",
                    "PB14 (HS111)-LL / SKU",
                    "PA10 (HS111)- CL12/ NES",
                    "TA6(MA201)-TS12/PSI"
                ],
                "4-4.50": [
                    "LC1,C2,C3(PH212)-G1/SPP",
                    "TA3(CI121)-TS6/TAJ",
                    "TA4(CI121)-TS7/MEE",
                    "TB11(PH211)-TS11/DIN"
                ],
                "NaN": [
                    "."
                ]
            },
            "FRI": {
                "9-9.50": [
                    "LB3,B4(PH211)-G1/VRT",
                    "LA5,A6(CI121)-G2/DSR",
                    "LB1,B2(PH211)-G3/MKC",
                    "LB5,B6(CI121)-FF1/SUD",
                    "TA1(CI121)-TS6/NEH",
                    "TA2(CI121)-TS7/AM",
                    "LA17,A18(MA211)- G9/AKK",
                    "PC1(CI121)- CL05/ALK,SON,PK",
                    "PB9(HS111)- / HK",
                    "PB10(HS111)- / EKS",
                    "PA10(GE111)- CAD1/ NKR",
                    "PC3(GE111)- CAD2/ SWET",
                    "PB14(GE111)- CAD3/ GGL"
                ],
                "10-10.50": [
                    "LB11,B12(PH211)-G1/RKD",
                    "LA5,A6(MA211)- G2/YG",
                    "LB1,B2(B11HS111)-G3/PRV",
                    "LA17,A18(PH211)-FF1/INC",
                    "LA1,A2(CI121)-FF2 /AJS",
                    "LA15,A16(B11HS111)-FF4/SHS",
                    "TB4(CI121)-TS6/TAJ",
                    "TB8(B11HS111)-TS7/AMN",
                    "TA4(PH211)-TS11/BCJ",
                    "TA3(PH211)-TS12/RAV",
                    "PC2(B15BT111)- BT3/EKT, PMG,SHD,AKT",
                    "PG1(PH271)- PL1/NG",
                    "PG2(PH271)- PL2/VRT"
                ],
                "11-11.50": [
                    "LB11,B12(MA211)- G1/NS",
                    "LB9,B10(MA211)- G2/HPT",
                    "LA3,A4(PH211)-G3/MKC",
                    "LA7,A8(B11HS111)-FF1/SGL",
                    "LA1,A2(MA211)- FF2/MPA",
                    "LB5,B6(B11HS111)-FF4/PU",
                    "TA18(PH211)-TS7/SND",
                    "TA15(PH211)-TS11/BCJ",
                    "TA5(PH211)-TS12/ABH"
                ],
                "12-12.50": [
                    "LUNCH"
                ],
                "1-1.50": [
                    "LA7,A8(MA211)-G1 /HPT",
                    "LA1,A2(PH211)-G2/RKG",
                    "LA17,A18(MA211)- FF1/AKK",
                    "TA16(PH211)-TS11/GPK",
                    "TB3(PH211)-TS12/VRT",
                    "TG1(B11HS111)-TS7/IJ",
                    "TG2(B11HS111)-TS8/VSE",
                    "LB11,B12(CI121)-G8/NEH"
                ],
                "2-2.50": [
                    "ALL BATCH FREE FOR MEETING",
                    "PB12(GE111)- CAD1/ NKR",
                    "PA7(GE111)- CAD2/ SNP",
                    "PA8(GE111)- CAD3/ CDN"
                ],
                "3-3.50": [
                    "LB9,B10(CI121)- G1/MEE",
                    "LB7,B8(MA211)- G2/RSC",
                    "LB1,B2(CI121)- G3/PSO",
                    "TA15(MA211)-TS6/YG",
                    "TA16(MA211)-TS7/AN",
                    "TB3(MA211)-TS8/BPC",
                    "TB4(MA211)-TS10/PAT",
                    "TB14(PH211)-TS11/RKG",
                    "TC1(B11HS111)-TS12/BB",
                    "TC2(B11HS111)- TS13/AMN",
                    "TC3(B11HS111)- TS14/PRI",
                    "PG1(CI271)-CL05/GZL,DEP,AMS",
                    "PG2(CI271)-CL06 /NSA,APR,PAG",
                    "PA5(PH271)-PL1 /MKC/SDC",
                    "PA6(PH271)- PL2/ABH/DIN",
                    "PA17(CI271)-CL21 /HN,PKU,AA",
                    "PA18(CI271)- CL22/AJS,MSH,ASK",
                    "PA3 (HS111)-LL / EKS",
                    "PA4 (HS111)- CL12/ YN"
                ],
                "4-4.50": [
                    "LC1,C2,C3(PH212)-G1/SPP",
                    "LB7,B8(CI121)- FF1/AM",
                    "LA10,B14(PH211)-FF2/NG"
                ],
                "NaN": []
            },
            "SAT": {
                "9-9.50": [
                    "LC1,C2,C3(B11CI121)- G1/SJA",
                    "LA10,B14(MA211)-G2 /AN",
                    "LB1,B2(CI121)-G3/PSO",
                    "LA7,A8(MA211)- FF1/HPT",
                    "LA1,A2(PH211)-FF2/RKG",
                    "PA5(CI271)-CL01 /PAG,KM,SAA",
                    "PA6(CI271)-CL02 /SYN,DSR,KP",
                    "PB5(CI271)- CL05/AJP,SHB,ASK",
                    "PB6(CI271)- CL06/ANP,AA,GZL,MAY",
                    "PA3(GE111)- CAD1/ CDN",
                    "PB3(GE111)- CAD2/ SNP",
                    "PB4(GE111)- CAD3/ SWET"
                ],
                "10-10.50": [
                    "LA17,A18(CI121)- G1/SLK",
                    "LA10,B14(CI121)- G2/DEP",
                    "LB1,B2(PH211)-G3/MKC",
                    "TC2(B11CI121)-TS6/SJA",
                    "TB8(MA211)-TS7/AKK",
                    "PA1(PH271)- PL1/INC",
                    "PA2(PH271)- PL2/NAR/ANU",
                    "PA8 (HS111)- CL24/ YN"
                ],
                "11-11.50": [
                    "LA15,A16(CI121)- G1/TAJ",
                    "LA5,A6(B11HS111)-G2/MKB",
                    "PB5 (HS111)- LL/ MDU",
                    "PB6(HS111)- CL12/ SKU",
                    "PC1(B15BT111)- BT3/EKT, PMG,SHD,AKT",
                    "PB1(CI271)- CL01/DEP,PSO,MSI",
                    "PB2(CI271)- CL02/NSA,TNV,PKU"
                ],
                "12-12.50": [
                    "TA15(CI121)-TS6/NEH",
                    "TA16(CI121)-TS7/SUD"
                ],
                "1-1.50": [],
                "2-2.50": [],
                "3-3.50": [],
                "4-4.50": [],
                "NaN": []
            },
            "1": {
                "9-9.50": [],
                "10-10.50": [],
                "11-11.50": [],
                "12-12.50": [],
                "1-1.50": [],
                "2-2.50": [],
                "3-3.50": [],
                "4-4.50": [],
                "NaN": []
            },
            "2": {
                "9-9.50": [],
                "10-10.50": [],
                "11-11.50": [],
                "12-12.50": [],
                "1-1.50": [],
                "2-2.50": [],
                "3-3.50": [],
                "4-4.50": [],
                "NaN": []
            },
            "3": {
                "9-9.50": [
                    "9-9.50"
                ],
                "10-10.50": [
                    "10-10.50"
                ],
                "11-11.50": [
                    "11-11.50"
                ],
                "12-12.50": [
                    "12-12.50"
                ],
                "1-1.50": [
                    "1-1.50"
                ],
                "2-2.50": [
                    "2-2.50"
                ],
                "3-3.50": [
                    "3-3.50"
                ],
                "4-4.50": [
                    "4-4.50"
                ],
                "NaN": []
            }
        },
        "subjects": [
            {
                "Code": "CI121",
                "Full Code": "18B11CI121",
                "Subject": "Fundamentals of Computers & Programming - II"
            },
            {
                "Code": "CI121",
                "Full Code": "18B15CI121",
                "Subject": "Fundamentals of Computers & Programming Lab- II"
            },
            {
                "Code": "CI121",
                "Full Code": "15B11CI121",
                "Subject": "Software Development Fundamentals-II"
            },
            {
                "Code": "CI271",
                "Full Code": "15B17CI271",
                "Subject": "Software Development Fundamentals Lab-II"
            },
            {
                "Code": "HS111",
                "Full Code": "24B11HS111",
                "Subject": "Universal Human Values"
            },
            {
                "Code": "GE111",
                "Full Code": "18B15GE111",
                "Subject": "Engineering Drawing & Design"
            },
            {
                "Code": "MA211",
                "Full Code": "15B11MA211",
                "Subject": "Mathematics-II"
            },
            {
                "Code": "MA212",
                "Full Code": "15B11MA212",
                "Subject": "Basic Mathematics-II"
            },
            {
                "Code": "HS111",
                "Full Code": "24B16HS111",
                "Subject": "Life Skills and Professional Communications"
            },
            {
                "Code": "BT111",
                "Full Code": "18B15BT111",
                "Subject": "Basic Bioscience Lab"
            },
            {
                "Code": "PH211",
                "Full Code": "15B11PH211",
                "Subject": "Physics-2"
            },
            {
                "Code": "PH271",
                "Full Code": "15B17PH271",
                "Subject": "Physics Lab-2"
            },
            {
                "Code": "PH212",
                "Full Code": "15B11PH212",
                "Subject": "Biophysical Techniques"
            }
        ]
    },
    2: {
        "timetable": {
            "MON": {
                "9-10AM": [
                    "9-10AM",
                    "L ABC (HS332) -LT2/PRI",
                    "L ABC (HS213) -CR425/YN",
                    "L ABC (HS412) -FF5/NES",
                    "L ABC (HS212) -LT1/BB",
                    "L ABC (HS434) -CS8/SKU",
                    "LA15,A16(B11HS111)-FF9/ANU"
                ],
                "10-11AM": [
                    "10-11AM",
                    "LB9,B10(CI411)-CS5/AW",
                    "LA15,A16(EC411)-FF5/SKA",
                    "LA17,A18(EC212)-G5/JYO",
                    "LA7,A8(EC212)-FF7/RB",
                    "LB13,B16 (EC213)-CS4/ACH",
                    "LB14,B15(MA301)-FF4/NF",
                    "LB3,B4(CI411)-FF8/PHP",
                    "LB5,B6(CI411)-FF9/MKT",
                    "LB7,B8(MA301)-FF2/NSK",
                    "TC1(BT411)-TS8/NDH, RD",
                    "TB1(MA301)-TS13/LK",
                    "TA5(B11HS111)-TS14/KMB",
                    "PA1(EC212)-CML/AGO,RK",
                    "PA2(EC473)-SPL/ABY,VSL",
                    "PA3(EC471)-EDC/AJK,RRJ",
                    "PA4(EC471)-ADE/AB,NTN",
                    "PA6(EC473)-MOD/VK,MJ",
                    "PB2(EC213)-BPL/SHS, MNA"
                ],
                "11-12PM": [
                    "11-12PM",
                    "LA15,A16(24B21EC212)-CR401/VRN",
                    "LA17,A18(EC611-G5/ALJ",
                    "LA7,A8(EC413)-FF5/KUL",
                    "LB11,B12(MA301)-FF7/AKK",
                    "LB14-B15(BT211)-G9/NV",
                    "LB7,B8(B11HS111)-FF4/RSC",
                    "TB9(EC213)-TS13MN",
                    "TB1(B11HS111)-TS14/MM",
                    "PB3(CI471)-CL05/AW,TKT,MOS,MAY",
                    "PB4(CI471)-CL06/SUD,SMS,TRN",
                    "PC1(BT372)-BIOINFO/NDH, CKJ, RD"
                ],
                "12-1PM": [
                    "12-1PM",
                    "LA1,A2(EC411)-CR401/NTN",
                    "LA15,A16(24B21EC312))-FF5/RS",
                    "LA17,A18(EC413)-G5/ABU",
                    "LA3,A4(EC411)-FF7/VD",
                    "LA5,A6, A10 (EC413)-CS4/MJ",
                    "LA7,A8(EC411)-FF1/APN",
                    "LB1,B2(MA301)-FF2/LK",
                    "LB11-B12(BT211)-G9/NV",
                    "LB14,B15,XG(CI313)-FF4/ATI",
                    "LB5,B6(B11HS111)-FF8/KSA",
                    "LB9,B10 (EC213)-FF9/MN",
                    "TB2(MA301)-TS6/NF",
                    "TB7(B11HS111)-TS14/EKS",
                    "TB8(B11HS111)-TS16/HK",
                    "LB13,B16(MA301)-G6/NF"
                ],
                "1-2PM": [
                    "1-2PM",
                    "LUNCH"
                ],
                "2-3PM": [
                    "2-3PM",
                    "TA1-A5, A7 (23HS211) -TS10/NAM",
                    "TA1-A10 (HS212) -TS11/BB",
                    "TA1-A5, A10 (HS213) -TS12/YN",
                    "TA1-A10, B1-B11 (HS332) -TS14/PRI",
                    "TA1-A10,B1-B2,B6 (HS412) -TS16/NES",
                    "TA1-A10, B1-B2 (HS431) -TS8/MB",
                    "TA1-A10, B12 (HS433) -TS17/SDA",
                    "TA1-A10, B9 (HS434) -TS20/SKU",
                    "TA1-A10 (HS435) -F10/PSH",
                    "LA17A18(11MA212)-G5/ GA",
                    "PA15G1(EC212)-FAB/RSB, TA",
                    "CR401 BLOCK FOR Fab LAB"
                ],
                "3-4PM": [
                    "3-4PM",
                    "LA7.A8(B11HS111)-CR401/SB",
                    "LB11,B12 (EC213)-G5/VSL",
                    "LB3-B4(BT211)-FF5/GMA",
                    "LB5,B6(MA301)-FF7/YG",
                    "LB7-B8(BT211)-CS4/ANS",
                    "TA10(B11HS111)-TS8/PAC",
                    "TB15(B11HS111)-TS10/IJ",
                    "TA4(B11HS111)-TS16/MM",
                    "PA2(EC212)-CML/NEJ,VNS",
                    "PA3(EC473)-SPL/JYO,KUL",
                    "PA6(EC471)-ADE/ATA,BVI",
                    "PB1(EC213)-BPL/JAS, MO",
                    "PB14(CI373)-CL03/PU,RTK",
                    "PC2-C3(BT372)-BIOINFO/NDH, CKJ, RD"
                ],
                "4-5PM": [
                    "4-5PM",
                    "LB11,B12(B11HS111)-CR401/MEE",
                    "LB9,B10(B11HS111)-FF5/APR",
                    "TA4(EC212)-TS14/RK"
                ]
            },
            "TUES": {
                "9-10AM": [
                    "LA15,A16(EC212)-CR401/NEJ",
                    "LA17,A18(EC212)-FF6/JYO",
                    "LA7,A8(EC411)-F6//APN",
                    "LB13,B16 (EC213)-LT2/ACH",
                    "LB14,B15(EC213)-F8/BVI",
                    "LB9,B10(CI411)-FF7/AW",
                    "TA1(B11HS111)-TS14/MB",
                    "TA10(EC411)-TS12/VRN",
                    "TA2(B11HS111)-TS16/HK",
                    "PA3(EC212)-CML/AGO/RK",
                    "PA4(EC473)-SPL/VK,TA",
                    "PA5(EC473)-MOD/KUL,VSL",
                    "PB7(EC213)-(ABB2-IOT/SMK,ATA",
                    "PB8(EC213)-BPL/VKH, MO"
                ],
                "10-11AM": [
                    "LA1,A2(EC411)-CR301/NTN",
                    "LA17,A18(EC611-G5/ALJ",
                    "LA7,A8(EC212)-FF5/RB",
                    "LB13,B16(CI411)-FF7/VIV",
                    "LB3,B4(MA301)-CS4/DCS",
                    "LB5,B6(MA301)-G6/YG",
                    "LB9,B10(MA301)G7-/SP",
                    "LC1-C3(BT312)-G8/IPS, GMA",
                    "TB14(B11HS111)-TS10/MB",
                    "TA6(B11HS111)-TS14/MDU",
                    "TB2(B11HS111)-TS16/YN",
                    "PA16G1(EC212)-FAB/YOG,HEM"
                ],
                "11-12PM": [
                    "LB1,B2(MA301)-CR401/LK",
                    "LB11,B12(CI411)-G5/TKT",
                    "LB14-B15(BT211)-FF5/NV",
                    "LB7,B8(CI411)-FF7/SHG",
                    "TA15(EC411)-TS13/SLM",
                    "TA18(EC413)-TS14/ATA",
                    "TA4(EC411)-TS16/SKA",
                    "TB3(EC213)-TS17/JG",
                    "TC2-C3(BT411)TS11-/NDH, RD",
                    "TC1(BT312)-TS10/IPS, GMA",
                    "PA10(EC471)-EDC/NHI,VRN",
                    "PA1(EC473)-SPL/VD, VSL",
                    "PA17(EC473)-MOD/ABU,ACH",
                    "PA5(EC212)-CML/RB,RIG",
                    "PB13(CI471)-CL01/AW,MOS,KRL,MAY",
                    "PB16(CI471)-CL02/AYS,ROH,TRN",
                    "PB5(EC213)-BPL/JAS,SB",
                    "PB6(EC213)-ABB2-IOT/RHA, BHG"
                ],
                "12-1PM": [
                    "LA3,A4(EC212)-CR401/RK",
                    "LB11-B12(BT211)-FF5/NV",
                    "LB14,B15,XG(CI313)-G5/ATI",
                    "LB3,B4(CI411)-FF7/PHP",
                    "LB9,B10 (EC213)-CS4MN",
                    "TA15(EC212)-TS13AMR",
                    "TC1(B11HS111)-TS14/KMB",
                    "TC2(B11HS111)-TS16/SDA",
                    "TC3(B11HS111)-TS17/MM"
                ],
                "1-2PM": [
                    "LUNCH"
                ],
                "2-3PM": [
                    "LA1,A2(B11HS111)-CR401/ASY",
                    "LA3-A4(B11HS111)-G5/SOC",
                    "LA7,A8(EC413)-FF5/KUL",
                    "LB1,B2 (EC213)-CR325/HEM",
                    "LB11,B12 (EC213)-CS4/VSL",
                    "LB5-B6(BT211)-FF8/EKT",
                    "LB7,B8 (EC213)-FF9/MO",
                    "LC1-C3(BT411)-CR301/NDH, RD",
                    "TB13(B11HS111)-TS16/HK",
                    "TB9(B11HS111)-TS14/MM",
                    "PA15(EC471)-EDC/NTN,BVI",
                    "PA16(EC471)-ADE/AJK,RRJ",
                    "PA17(EC671)-MOD/ALJ,RU",
                    "PA18(EC473)-SPL/ABY, TA",
                    "PA6(EC212)-CML/NEJ/Prof. Shweta",
                    "PB15(EC213)-(BPL/VKH, RHA",
                    "PB16(EC213)-ABB2-IOT/SHS,MNA"
                ],
                "3-4PM": [
                    "LA1,A2(EC212)-CR401/AGO",
                    "LA3,A4(EC413)-G5/SB",
                    "LB1,B2(B11HS111)-FF5/RAV",
                    "LB3,B4 (EC213)-FF7/YOG",
                    "LC1-C3(BT313)-CS4/SOC,PC",
                    "TB14(CI313)-TS17/ATI",
                    "TB7(EC213)-TS20MO",
                    "TB9(MA301)-TS12/LK",
                    "TB10(MA301)-TS13/DCS",
                    "TB11(MA301)-TS14/GA",
                    "TB12(MA301)-TS16/ATI",
                    "PB5(CI471)-/SHG,DL,KSA",
                    "PB6(CI471)-/PHP,VIV,AV"
                ],
                "4-5PM": [
                    "LA15,A16(24B21EC212)-CR401/VRN",
                    "LA5,A6, A10(EC411)-FF2/GK",
                    "LB13,16(BT211)-FF5/AKT",
                    "LB1-B2(BT211)-FF7/AV",
                    "LB3-B4(BT211)-CS4/GMA",
                    "LB7-B8(BT211)-G4/ANS",
                    "LB9-B10(BT211)-FF3/PC",
                    "LC1-C3(B11HS111)-FF4/SMO",
                    "TB15(CI313)-TS8/ATI",
                    "TA17(EC212)-TS14/JYO"
                ]
            },
            "WED": {
                "9-10AM": [
                    "LA1,A2(EC413)-FF6/VK",
                    "LA15,A16(EC212-FF9/NEJ",
                    "LA3,A4(EC413)-FF5/SB",
                    "LB5,B6(B11HS111)-FF7/KSA",
                    "LB7,B8(MA301)-CS425/NSK",
                    "TB3(B11HS111)-TS14/MB",
                    "TB4(B11HS111)-TS16/HK",
                    "TA3(EC212)-TS13/NHI",
                    "PA7(EC212)-CML/RB,RIG",
                    "PA18(EC671)-MOD/RU,TA",
                    "PB12(EC213)-BPL/BHG,TA",
                    "PA8(EC471)-ADE/AB,VRN",
                    "PB9(CI471)-CL06/SUD,TRN,ROH,MAY"
                ],
                "10-11AM": [
                    "LA1,A2(EC212)-CR425/AGO",
                    "LA3,A4(EC411)-G5/VD",
                    "LA5,A6, A10(EC411)-FF5/GK",
                    "LB1,B2(CI411)-FF7/MOS",
                    "LB13,B16(CI411)-CS4/VIV",
                    "LB14,B15(MA301)-G8/NF",
                    "LB5,B6 (EC213)-G9/JAS",
                    "LC1-C3(BT312)-G4/IPS, GMA",
                    "TB10(EC213)-TS13/MN",
                    "TB4(EC213)-TS14/JG",
                    "TB7(MA301)-TS8/YG",
                    "PA15G2(EC212)-FAB/YOG/HEM"
                ],
                "11-12PM": [
                    "LA1,A2(EC411)-CR401/NTN",
                    "LA5,A6, A10 (EC212)-G5/VNS",
                    "LB11,B12(CI411)-FF5/TKT",
                    "LB3,B4(B11HS111)-FF7/NSK",
                    "LB7,B8(CI411)-CS4/SHG",
                    "LB9,B10(MA301)-G4/SP",
                    "TA18(EC212)-TS13/JYO",
                    "TB1(EC213)-TS17/MNA",
                    "TB5(B11HS111)-TS14/KMB",
                    "TA3(B11HS111)-TS16/SKU",
                    "LB5,B6(CI411)- FF8/MKT",
                    "PA16(EC213)-VDA/SKA,TA",
                    "PA17(24B35EC212)- SPL/ALJ, VD",
                    "PA7(EC473)-MOD/ABY,TA",
                    "PA8(EC212)-CML/RB,RIG",
                    "PB13(EC213)-BPL/BHG,RHA",
                    "PB14(EC213)-(ABB2-IOT/SMK,RMD",
                    "PB15(CI373)-CL01/HN,ATI",
                    "PC1(BT372)-BT3/SMG, GMA, ASM, ANM",
                    "PC2-C3(BT373)-BT2/SMO,SOC, SHM, MAS"
                ],
                "12-1PM": [
                    "LB11,B12(MA301)-CR401/AKK",
                    "LA5,A6, A10 (EC413)-G5/MJ",
                    "LB3,B4(CI411)-FF5/PHP",
                    "LB9,B10 (EC213)-FF7MN",
                    "TB16(EC213)-TS13/VSL",
                    "TB2(EC213)-TS14/MNA",
                    "TB5(MA301)-TS6/DCS"
                ],
                "1-2PM": [
                    "LUNCH"
                ],
                "2-3PM": [
                    "L ABC (HS332) -CR401/PRI",
                    "L ABC (HS213) -FF8/YN",
                    "L ABC (HS412) -FF5/NES",
                    "L ABC (HS212) -LT1/BB",
                    "L ABC (23HS211) -CS4/NAM",
                    "L ABC (HS431) -G4/MB",
                    "L ABC (HS433) -G6/SUD",
                    "L ABC (HS434) -G7/SKU",
                    "L ABC (HS435) -G8/PSH",
                    "LA15,A16(EC411)-G9/SKA",
                    "LA17,A18(EC413)-G5/ABU"
                ],
                "3-4PM": [
                    "LA15,A16(24B21EC212)-CR401/VRN",
                    "LA17,A18(B11HS111)-G5/MTR",
                    "LA3,A4(EC212)-FF5/RK",
                    "LA7.A8(B11HS111)-FF7/SB",
                    "LB11-B12(BT211)-FF2/NV",
                    "LB13,16(BT211)-G4/AKT",
                    "LB14,B15(EC213)-G6/BVI",
                    "LB1-B2(BT211)-G7/AV",
                    "LB3,B4 (EC213)-G8/YOG",
                    "LB5-B6(BT211)-G9/EKT",
                    "TA2(EC413)-TS13/RRJ",
                    "TA5(EC411)-TS14/SKA",
                    "TA6(EC411)-TS16/VKH",
                    "TC1(BT313)-TS10/SOC,PC",
                    "PA10(EC212)-CML/AMR,VNS",
                    "PB10(CI471)-CL05/VIV,AYS,ROH",
                    "PB7(CI471)-CL06/SHG,ASA,DL",
                    "PB8(CI471)-CL07/ANV,AV,PHP",
                    "PB9(EC213)-BPL/JAS, MO"
                ],
                "4-5PM": [
                    "LA15,A16(24B21EC312)-CR401/RS",
                    "LB1,B2 (EC213)-CR425/HEM",
                    "LB13-B16(B11HS111)-FF7G5/NDH",
                    "LB5,B6(MA301)-CS4/YG",
                    "LC1-C3(B11HS111)-G6/SMO",
                    "TA3(EC411)-TS16/VD",
                    "TA7(EC413)-TS13/KUL",
                    "TA8(B11HS111)-TS14/HK",
                    "TB15(MA301)-TS8/LK"
                ]
            },
            "THUR": {
                "9-10AM": [
                    "LA1,A2(B11HS111)-LT2/ASY",
                    "LA17,A18(EC611)-G5/ALJ",
                    "LB9,B10(B11HS111)-FF5/APR",
                    "TA15(B11HS111)-TS14/HK",
                    "TB4(MA301)-TS8/DCS",
                    "TC2-C3(BT312)-TR326/IPS, GMA",
                    "PA10(EC473)-SPL/VK ,MJ",
                    "PA4(EC212)-CML/NEJ, VNS",
                    "PA7(EC471)-EDC/NHI,BVI",
                    "PB11(EC213)-BPL/VKH, SB",
                    "PB12(CI471)-CL03/MOS,AYS,KRL",
                    "PA16G2(EC212)-FAB/SHI, HEM"
                ],
                "10-11AM": [
                    "LA17,A18(EC413)-G5/ABU",
                    "LB13,B16 (EC213)-FF5/ACH",
                    "LB14,B15(MA301)-FF7/NF",
                    "LB3,B4 (EC213)-FF8/YOG",
                    "LB5,B6 (EC213)-G6/JAS",
                    "LB7,B8(B11HS111)-G8/RSC",
                    "LB9,B10(CI411)-G9/AW",
                    "TA1(EC212)-TS13/AGO",
                    "PC1(BT373)-BT2/SMO,SOC, SHM, MAS",
                    "PC2-C3(BT471)-BT3/SMG, GMA, ASM, ANM",
                    "PA15(EC214)-ABB2-IOT\\GV, RS"
                ],
                "11-12PM": [
                    "LA3,A4(EC411)-G9/VD",
                    "LB1,B2(CI411)-G5/MOS",
                    "LB11,B12(CI411)-FF5/TKT",
                    "LB14-B15(BT211)-FF7/NV",
                    "LB3,B4(B11HS111)-CS4/NSK",
                    "LB7,B8 (EC213)-G8/MO",
                    "TA1(EC411)-TS13/NTN",
                    "TA10(EC212)-TS17/SMK",
                    "TA2(EC212)-TS20/ALJ",
                    "TA7(EC212)-F7/RB",
                    "TA8(EC411)-F4/VRN",
                    "TB5(EC213)-TR302/JAS",
                    "TB6(EC213)-TR307/RIG",
                    "TA5(EC413)-TR305/RRJ",
                    "TB10 (B11HS111)-TS14/MM",
                    "TA17(B11HS111)-TS16/SKU"
                ],
                "12-1PM": [
                    "LA15,A16(B11HS111)-G6/ANU",
                    "TA7-A8, B1-B4,B6-B8 (HS213) -TS10/YN",
                    "TB12-B15, C1-C3 (HS332) -TS14/PRI",
                    "TB1-B11 (23HS211) -TS6/NAM",
                    "TB1-B6 (HS433) -TS17/SDA",
                    "TB1-B6 (HS435) -F10/PSH",
                    "TB1-B8, B10-B12, B14 (HS434) -TS20/SKU",
                    "TB1-B9 (HS212) -TS7/BB",
                    "TB3-B15, C1-C3 (HS431) -TS8/MB",
                    "TB3-B5, B10-B11 (HS412) -TS16/NES",
                    "LA17A18(11MA212)-G5/ GA"
                ],
                "1-2PM": [
                    "LUNCH"
                ],
                "2-3PM": [
                    "LA5,A6, A10(EC411)-G5/GK",
                    "LA7,A8(EC413)-FF5/KUL",
                    "LB13,16(BT211)-FF7/AKT",
                    "LB1-B2(BT211)-CS4/AV",
                    "LB3-B4(BT211)-G6/GMA",
                    "LB5-B6(BT211)-G7/EKT",
                    "LB7-B8(BT211)-G8/ANS",
                    "LC1-C3(BT411)-G9/NDH, RD",
                    "TA16(EC212)-TS13/AMR",
                    "TA17(EC413)-TS17/ATA",
                    "TB12(B11HS111)-TS14/MM",
                    "TB14(MA301)-TS8/ATI",
                    "PA1(EC471)-EDC/NTN,VRN",
                    "PA15(EC213)-VDA/SKA,TA",
                    "PA18(EC212)-CML/AGO, RK",
                    "PA2(EC471)-ADE/NHI,BVI",
                    "PB10(EC213)-BPL/SMK,SB"
                ],
                "3-4PM": [
                    "LA5,A6, A10(B11HS111)-CR401/PSH",
                    "LB1,B2(MA301)-G5/LK",
                    "LB13-B16(B11HS111)-FF5/NDH",
                    "LB14,B15(B11HS111)-FF7/SG",
                    "LB3,B4(MA301)-CS4/DCS",
                    "TA16(B11HS111)-TS16/MM",
                    "TA3(EC413)-TS17/RU",
                    "TA4(EC413)-TS20/ABY",
                    "TA7(EC411)-TS13/APN",
                    "TB11(B11HS111)-TS14/MB",
                    "TB6(MA301)-F10/GA"
                ],
                "4-5PM": [
                    "LA1,A2(EC413)-CR401/VK",
                    "LA15,A16(EC212-FF1//NEJ",
                    "LA5A6, A10 (EC212)-FF5/VNS",
                    "LB1,B2 (EC213)-CR425/HEM",
                    "LB9-B10(BT211)-CS4/PC",
                    "TA7(B11HS111)-TS14/HK",
                    "TB13(EC213)-TS13/ACH",
                    "TB8(MA301)-TS8/NF"
                ]
            },
            "FRI": {
                "9-10AM": [
                    "LA1,A2(EC413)-FF4/VK",
                    "LA5,A6, A10 (EC413)-FF5/MJ",
                    "LB7,B8(MA301)-FF3/NSK",
                    "TA16(EC411)-TS13SLM",
                    "TA18(B11HS111)-TS16/SKU",
                    "TB16(B11HS111)-TS14/MM",
                    "PB1(CI471)-CL02/AW,AV,KRL",
                    "PB2(CI471)-CL03/PHP,DL,TKT"
                ],
                "10-11AM": [
                    "LA1,A2(EC212)-FF8/AGO",
                    "LA5,A6, A10 (EC212)-G5/VNS",
                    "LA7,A8(EC212)-FF5/RB",
                    "LB11,B12 (EC213)-FF7/VSL",
                    "LB7,B8(CI411)-CS4/SHG",
                    "LC1-C3(BT411)-FF9/NDH, RD",
                    "TB14(EC213)-TS13/ACH",
                    "TB15(EC213)-TS14/BVI",
                    "TB3(MA301)-TS8/DCS",
                    "PA16(EC214)-ABB2-IOT/GV,RS",
                    "PA17(EC212)-CML/Prof. Shweta, MNA",
                    "PA18(24B35EC212)- SPL/ALJ, VD",
                    "PB4(EC213)-BPL/BHG,RMD",
                    "PA15G3(EC212)-FAB/YOG,TA"
                ],
                "11-12PM": [
                    "LA3-A4(B11HS111)-CR401/SOC",
                    "LA7,A8(EC411)-G5/APN",
                    "LB1,B2(CI411)-FF5/MOS",
                    "LB13,B16(CI411)-FF7/VIV",
                    "LB5,B6(CI411)-CS4/MKT",
                    "LB7,B8 (EC213)-FF8/MO",
                    "LB9,B10(MA301)-FF9/SP",
                    "TA1(EC413)-TS13/VK",
                    "TA10(EC413)-TS14/ABY",
                    "TA2(EC411)-TS16/NTN",
                    "TA5(EC212)-TS17/VNS",
                    "TA6(EC413)-TS20/RU",
                    "TB11(EC213)-F10/VSL"
                ],
                "12-1PM": [
                    "TA6,A8-A10,B12-B15,C1-C3 (23HS211) -TS6/NAM",
                    "TB10-B15, C1-C3 (HS212) -TS7/BB",
                    "TB5,B9-B15, C1-C3(HS213) -TS10/YN",
                    "TB7-B9, B12-B15, C1-C3 (HS412) -TS16/NES",
                    "TB7-B11,B13-B15,C1-C3 (HS433) -TS17/SDA",
                    "TB13, B15, C1-C3 (HS434) -TS20/SKU",
                    "TB7-B15, C1-C3(HS435) -F10/PSH",
                    "LA17A18(11MA212)-G5/ GA"
                ],
                "1-2PM": [
                    "LUNCH"
                ],
                "2-3PM": [
                    "BLOCKED"
                ],
                "3-4PM": [
                    "LA15,A16(24B21EC312)-CR401/RS",
                    "LA17,A18(B11HS111)-G5/MTR",
                    "LA3,A4(EC413)-FF5/SB",
                    "LA5,A6, A10(B11HS111)-FF7/PSH",
                    "LB1,B2(B11HS111)-CS4/RAV",
                    "LB13,B16(MA301)-G6/NF",
                    "LB14,B15(EC213)-G7/BVI",
                    "LB3,B4(MA301)-G8/DCS",
                    "LB5,B6 (EC213)-G9JAS",
                    "LB9-B10(BT211)-FF1/PC",
                    "TA8(EC413)-TS16/KUL",
                    "TB12(EC213)-TS17/VSL",
                    "TB8(EC213)-F7/MO",
                    "LC1-C3(BT312)-CS2/IPS, GMA",
                    "PB3(EC213)-BPL/SHS/ATA",
                    "PB11(CI471)-CL01/SMS,VIV,PHP"
                ],
                "4-5PM": [
                    "LA15,A16(EC411)-CR401/SKA",
                    "LA17,A18(EC212)-G5/JYO",
                    "TB6(B11HS111)-TS14/MM",
                    "TA6(EC212)-TS16/VNS",
                    "TA8(EC212)-TS17/RB",
                    "LC1-C3(BT313)-CS2/SOC,POC",
                    "LA3,A4(EC212)-CR425//RK"
                ]
            },
            "SAT": {
                "9-10AM": [
                    "L ABC (23HS211) -G5/NAM",
                    "L ABC (HS431) -G6/MB",
                    "L ABC (HS433) -G7/SDA",
                    "L ABC (HS435) -G8/PSH"
                ],
                "10-11AM": [
                    "LB13,B16(MA301)-CR425/NF",
                    "LB14,B15(B11HS111)-G5/SG",
                    "LC1-C3(BT313)-FF5/SOC,PC",
                    "LB3,B4(MA301)-G6/DCS",
                    "PA8(EC473)-MOD/ABU,KUL",
                    "PA5(EC471)-EDC/AJK,RRJ",
                    "PA16G3(EC212)-FAB/RSB, SHI"
                ],
                "11-12PM": [
                    "LB11,B12(B11HS111)-CR401/MEE",
                    "TC2-C3(BT313)-TS10/SOC,PC",
                    "TB16(MA301)-TS8/DCS"
                ],
                "12-1PM": [
                    "LB11,B12(MA301)-CR401/AKK",
                    "LB14,B15,XG(CI313)-G5/ATI",
                    "TB13(MA301)-TS8/NF"
                ],
                "1-2PM": [
                    "LUNCH"
                ],
                "2-3PM": [],
                "3-4PM": [],
                "4-5PM": []
            }
        },
        "subjects": [
            {
                "Code": "EC411",
                "Full Code": "15B11EC411",
                "Subject": "Analogue Electronics"
            },
            {
                "Code": "BT312",
                "Full Code": "15B11BT312",
                "Subject": "Microbiology"
            },
            {
                "Code": "EC212",
                "Full Code": "18B11EC212",
                "Subject": "Analog and Digital Communication"
            },
            {
                "Code": "BT313",
                "Full Code": "15B11BT313",
                "Subject": "Genetics and Developmental Biology"
            },
            {
                "Code": "EC413",
                "Full Code": "15B11EC413",
                "Subject": "Digital Signal Processing"
            },
            {
                "Code": "BT411",
                "Full Code": "15B11BT411",
                "Subject": "Introduction to Bioinformatics"
            },
            {
                "Code": "EC471",
                "Full Code": "15B17EC471",
                "Subject": "Analogue Electronics LAB"
            },
            {
                "Code": "BT372",
                "Full Code": "15B17BT372",
                "Subject": "Microbiology Lab"
            },
            {
                "Code": "EC212",
                "Full Code": "18B15EC212",
                "Subject": "Analog and Digital Communication LAB"
            },
            {
                "Code": "BT373",
                "Full Code": "15B17BT373",
                "Subject": "Genetics and Developmental Biology Lab"
            },
            {
                "Code": "EC473",
                "Full Code": "15B17EC473",
                "Subject": "Digital Signal Processing LAB"
            },
            {
                "Code": "BT471",
                "Full Code": "15B17BT471",
                "Subject": "Bioinformatics Lab"
            },
            {
                "Code": "24B21EC312",
                "Full Code": "24B21EC312",
                "Subject": "MICROCONTROLLER AND COMPUTER ARCHITECTURE"
            },
            {
                "Code": "BT211",
                "Full Code": "19B13BT211",
                "Subject": "Environmental Studies (CSE/IT 62)"
            },
            {
                "Code": "24B21EC212",
                "Full Code": "24B21EC212",
                "Subject": "INTRODUCTION TO MICROFABRICATION TECH"
            },
            {
                "Code": "MA301",
                "Full Code": "15B11MA301",
                "Subject": "Probability and Random Processes"
            },
            {
                "Code": "EC213",
                "Full Code": "24B25EC213",
                "Subject": "INTRODUCTION TO VLSI LIFE CYCLE LAB"
            },
            {
                "Code": "HS434",
                "Full Code": "15B1NHS434",
                "Subject": "Principles of Management"
            },
            {
                "Code": "EC214",
                "Full Code": "24B25EC214",
                "Subject": "MICROCONTROLLER LAB"
            },
            {
                "Code": "HS332",
                "Full Code": "16B1NHS332",
                "Subject": "Quantitative methods for Social Science"
            },
            {
                "Code": "EC611",
                "Full Code": "15B11EC611",
                "Subject": "TELECOMMUNICATION  NETWORKS"
            },
            {
                "Code": "HS431",
                "Full Code": "15B1NHS431",
                "Subject": "Introduction to Literature"
            },
            {
                "Code": "C671",
                "Full Code": "15B17EC671",
                "Subject": "TELECOMMUNICATION NETWORK LAB"
            },
            {
                "Code": "HS435",
                "Full Code": "15B1NHS435",
                "Subject": "Financial Accounting"
            },
            {
                "Code": "EC213",
                "Full Code": "18B11EC213",
                "Subject": "DIGITAL SYSTEM"
            },
            {
                "Code": "NHS433",
                "Full Code": "15B1NHS433",
                "Subject": "Introduction to Sociology"
            },
            {
                "Code": "EC213",
                "Full Code": "18B15EC213",
                "Subject": "DIGITAL SYSTEM LAB"
            },
            {
                "Code": "HS211",
                "Full Code": "23B12HS211",
                "Subject": "Introduction to Political Science"
            },
            {
                "Code": "24B35EC212",
                "Full Code": "24B35EC212",
                "Subject": "Applied Mathematical Computational lab"
            },
            {
                "Code": "HS412",
                "Full Code": "19B12HS412",
                "Subject": "Industrial Economics"
            },
            {
                "Code": "24B11HS111",
                "Full Code": "24B11HS111",
                "Subject": "UHV"
            },
            {
                "Code": "HS212",
                "Full Code": "24B12HS212",
                "Subject": "Science of Happiness"
            },
            {
                "Code": "CI411",
                "Full Code": "15B11CI411",
                "Subject": "Algorithms and Problem Solving"
            },
            {
                "Code": "HS213",
                "Full Code": "24B12HS213",
                "Subject": "Sociology of Work"
            },
            {
                "Code": "CI471",
                "Full Code": "15B17CI471",
                "Subject": "Algorithms and Problem Solving Lab"
            },
            {
                "Code": "CI313",
                "Full Code": "15B11CI313",
                "Subject": "Computer Organisation and Architecture"
            },
            {
                "Code": "CI373",
                "Full Code": "15B17CI373",
                "Subject": "Computer Organisation and Architecture\nLab"
            }
        ]
    },
    3: {
        "timetable": {
            "MON": {
                "8-9AM": [
                    "LC1-C3(D2C10)-CS1/AKT",
                    "LC1-C3(D2C20)-CS2/SMO",
                    "L(D2A20)-CS3/PKY",
                    "L(17B11D2A10)-CS4/SMK",
                    "L(D2A40)-CS5/VKH",
                    "L(D2A30)-CS6/SHI",
                    "LB(D2B30)-CS7/SON",
                    "LB(D2B40)-CR301/VIK",
                    "LB(D2B20)-CR325/SYN",
                    "LB1,10-12,14,15(D2B10)-CR401/SHV",
                    "LB2-9(D2B10)-501/SHP"
                ],
                "9-10AM": [
                    "L(17B1ND3A20)-CS1/AB",
                    "L(15B11D3A50)-CS2/RRJ",
                    "LB(D3B30)-CS3/GZL",
                    "LB(D3B50)-CS4/DL",
                    "L(17B1ND3A30)-CS5/ABY",
                    "L(24D3A40)-CS6/RHA",
                    "L(24B12D3A10)-CS7/RU",
                    "LB(D3B40)-CR301/PU",
                    "LB(D3B10)-CR325/PK",
                    "LB(D3B20)-CR401/PKAU",
                    "TA1-A10,C1-C3 (H3H70)-TS13/MSU",
                    "T A1-A10,C1-C3 (H3H30)-FF1/IJ",
                    "TA1-A5 (H3H10)-TS7/SDA",
                    "TA6-A10,C1-C3 (H3H10)-TS20/AMN",
                    "TA1-A10,C1-C3 (H3H80)-TS10/VSE",
                    "TA1-A10,C1-C3 (H3H60)-TS11/KMB",
                    "TA1-A6 (H3H20) -TS12/MB",
                    "TA8-A10,C1-C3 (H3H20) -TS14/PAC",
                    "TA1-A10,C1-C3 (H3H90)-TS16/MRB",
                    "TA1-A10,C1-C3(H3H40)-TS17/PSH",
                    "TA1-A10,C1-C3(H3H50)-FF2/NAM"
                ],
                "10-11AM": [
                    "TA3(EC315)-TS20/AKS",
                    "LC1-C3(BT414)-CS1/RAC,SHM",
                    "LB14,15(CI521)-CS2/KSA",
                    "LB9,10(CS311)-CS3/KA",
                    "LB7,8(CS311)-G4/NAC",
                    "LB11,12(CS311)-CR425/AKM",
                    "LA5-A6(EC315)-G6/SCH",
                    "LA7-A8-A10(EC315)-G7/AJK",
                    "PB3(B15CS311)-CL16/PRV,PTK",
                    "PB2(B15CS311)-CL18/AMK,JAG",
                    "PB1(B15CS311)-CL17/AST,VIK",
                    "PA1(15EC315)-VDA/SHA, RMD",
                    "PA2(EC671)-ACL/RU, AMR"
                ],
                "11-12PM": [
                    "LC1-C3(BT611)-CS1/VBR, CKJ",
                    "LB14,15(CI621)-CS2/NSA,PAG",
                    "LB9,10(CI513)-CS3/RTK",
                    "LB7,8(CI513)-G4/RCA",
                    "LB11,12(CI513)-CR425/AKT",
                    "LA7-A8-A10(EC611)-FF8/JG",
                    "LA5-A6(EC611)-FF9/PKY"
                ],
                "12-1PM": [
                    "Lunch"
                ],
                "1-2PM": [
                    "LB(CI514)-G4/ASA"
                ],
                "2-3PM": [
                    "LA1-A2(EC315)-G4/SHA",
                    "LA3-A4(EC315)-CS1/AKS",
                    "PA7(15EC315)-VDA/SCH, MN",
                    "PA8(EC671)-ACL/JG, ACH",
                    "PB1(CI573)-CL09/IC,PRK",
                    "PB2(CI573)-CL10/AKT,RJM",
                    "PB3(CI573)-CL11/KJ,ATI",
                    "PB1-5(CI574)-C15/ASA,ANP",
                    "PB6-12(CI574)-CL16/DL,SYN",
                    "PC2,C3 (BT671)-BT1/VBR, PC,NV, ANM",
                    "PC1(BT474)-BT2/RAC, SHM, RG, MAS",
                    ";;"
                ],
                "3-4PM": [
                    "LA1-A2(EC611)-G4/AB",
                    "LA3-A4(EC611)-CS1/AMR",
                    "TB15(CI621)-TR305/PAG"
                ],
                "4-5PM": [],
                "5-6PM": []
            },
            "TUES": {
                "8-9AM": [
                    "LC1-C3(D3C10)-CS1/VGU",
                    "LC1-C3(D3C20)-CS2/AV",
                    "L(15B11D3A50)-CS3/RRJ",
                    "L(24D3A40)-CS4/RHA",
                    "L(24B12D3A10)-CS5/RU",
                    "LB(D2B30)-CS6/SON",
                    "LB2-9(D2B10)-CS7/SHP",
                    "LB(D2B40)-CR301/VIK",
                    "LB(D2B20)-CR325/SYN",
                    "LB1,10-12,14,15(D2B10)-CR401/SHV"
                ],
                "9-10AM": [
                    "LAB(O1M40)-CS1/NSK",
                    "LAB(O1M30)-CS2/RSH",
                    "LABC(O1M20)-CS3/ATI",
                    "LAB(O1M10)-CS4/NS",
                    "LABC(O1H10)-CS5/MDU",
                    "LABC(O1H20)-CS6/YN",
                    "L(17B1ND3A20)-CS7/AB",
                    "L(24B12O1A10)-CS8/RIG",
                    "L(17B1ND3A30)-CR501/ABY",
                    "L(24B12O1A20)-CR526/MNA",
                    "LAB(O1P10)-G4/BCJ",
                    "LAB(O1P30)-G9/RAV",
                    "LABC(O1P40)-CR301/VBH",
                    "LAB(O1P50)-CR325/INC",
                    "LAB(O1P20)-CR425/MTR"
                ],
                "10-11AM": [
                    "TA4(EC315)-TS20/AKS",
                    "LC1-C3(BT414)-FF8/RAC,SHM",
                    "LB7,8(CS311)-G4/NAC",
                    "LB9,10(CS311)-CR425/KA",
                    "LB11,12(CS311)-CS1/AKM",
                    "LB14,15(CI521)-CS2/KSA",
                    "LA1-A2(EC315)-CS3/SHA",
                    "PA5(15EC315)-VDA/SCH, MN",
                    "PA6(EC671)-ACL/PKY, TA",
                    "PB4(B15CS311)-CL13/AST,VIK",
                    "PB5(B15CS311)-CL14/AMK,JAG",
                    "PB6(B15CS311)-CL15/PTK,PAR"
                ],
                "11-12PM": [
                    "TA7(EC315)-F10/AJK",
                    "LC1-C3(BT611)-FF8/VBR, CKJ",
                    "LB7,8(CI513)-G4/RCA",
                    "LB9,10(CI513)-CR425/RTK",
                    "LB11,12(CI513)-CS1/AKT",
                    "LB14,15(CI621)-CS2/NSA,PAG",
                    "LA1-A2(EC611)-CS3/AB"
                ],
                "12-1PM": [
                    "Lunch"
                ],
                "1-2PM": [
                    "LABC(V1B30)-G4/TKT",
                    "LB(V1B10)-CS1/VS",
                    "LABC(V1B40)-CS2/TRN",
                    "LB(V1B20)-CS3/SVS"
                ],
                "2-3PM": [
                    "LB1,2(CS311)-G4/AMK",
                    "LB3,4(CS311)-CR425/AST",
                    "LB5,6(CS311)-CS1/JAG",
                    "LA7-A8-A10(EC315)-CS2/AJK",
                    "LA5-A6(EC315)-CS3/SCH",
                    "PA4(15EC315)-VDA/AKS, APN",
                    "PB7(CI573)-CL13/IC,PRK,ASI",
                    "PB8(CI573)-CL14/VRN,SHR",
                    "PB9(CI573)-CL15/AKT, RTK"
                ],
                "3-4PM": [
                    "LB1,2(CI513)-G4/DCH",
                    "LB3,4(CI513)-CR425/KJ",
                    "LB5,6(CI513)-CS1/RJM",
                    "LA7-A8-A10(EC611)-CS2/JG",
                    "LA5-A6(EC611)-CS3/PKY"
                ],
                "4-5PM": [],
                "5-6PM": []
            },
            "WED": {
                "8-9AM": [
                    "LABC (H3H70)-CS1/MSU",
                    "LABC (H3H50)-CS2/NAM",
                    "LABC (H3H60)-CS3/KMB",
                    "LA1-A10, B11-B15, C1-C3(H3H20) -CS4/MB",
                    "LB1-B10 (H3H20) -CS5/PAC",
                    "LABC (H3H40)-CS6/PSH",
                    "LABC (H3H30)-CS7/IJ",
                    "LABC (H3H80)-CS8/VSE",
                    "LABC (H3H90)-CR301/MRB",
                    "LA1-A10, B11-B15 (H3H10)-CR325/AMN",
                    "LB1-B10,C1-C3 (H3H10)-CR401/SDA"
                ],
                "9-10AM": [
                    "LC1-C3(D2C10)-CS1/ANM",
                    "LC1-C3(D2C20)-CS2/SMO",
                    "LB(D3B30)-CS3/GZL",
                    "LB(D3B50)-CS4/DL",
                    "L(D2A20)-CS5/PKY",
                    "L(17B11D2A10)-CS6/SMK",
                    "L(D2A40)-CS7/VKH",
                    "L(D2A30)-CS8/SHI",
                    "LB(D3B40)-CR301/PU",
                    "LB(D3B10)-CR325/PK",
                    "LB(D3B20)-CR401/PKAU"
                ],
                "10-11AM": [
                    "LC1-C3(BT414)-CS1/RAC,SHM",
                    "TA2(EC315)-F10/SHA",
                    "TA10(EC315)-TR302/RHA",
                    "PA1(EC671)-ACL/PKY, AMR",
                    "PB7(B15CS311)-CL13/AKM,VIK",
                    "PB8(B15CS311)-CL14/AMK,JAG",
                    "PB9(B15CS311)-CL15/KA,NAC",
                    "PB15(CI681)-CL08/VRN, PAG"
                ],
                "11-12PM": [
                    "LC1-C3(BT611)-CS1/VBR, CKJ",
                    "TB14(CI621)-TR302/NSA",
                    "TA5(EC315)-TS20/SCH",
                    "TA8(EC315)-F7/AJK"
                ],
                "12-1PM": [
                    "LUNCH"
                ],
                "1-2PM": [],
                "2-3PM": [
                    "PA2(15EC315)-VDA/AKS, APN",
                    "PA3(EC671)-ACL/NSH, JYO",
                    "LA5-A6(EC315)-CS2/SCH",
                    "LA7-A8-A10(EC315)-CS3/AJK",
                    "PB10(CI573)-CL09/ASI,PRK",
                    "PB11(CI573)-CL10/RCA,RTK",
                    "PB12(B15CS311)-CL11/KA,AST"
                ],
                "3-4PM": [
                    "LA5-A6(EC611)-CS2/PKY",
                    "LA7-A8-A10(EC611)-CS3/JG"
                ],
                "4-5PM": [],
                "5-6PM": []
            },
            "THUR": {
                "8-9AM": [
                    "LAB(O1M40)-CS1/NSK",
                    "LAB(O1M30)-CS2/RSH",
                    "LABC(O1M20)-CS3/ATI",
                    "LAB(O1M10)-CS4/NS",
                    "LABC(O1H10)-CS5/MDU",
                    "LABC(O1H20)-CS6/YN",
                    "L(24B12O1A20)-CS7/MNA",
                    "L(24B12O1A10)-CS8/RIG",
                    "LAB(O1P10)-G8/BCJ",
                    "LABC(O1P40)-FF2/VBH",
                    "LAB(O1P50)-FF3/INC",
                    "LAB(O1P20)-FF4/MTR",
                    "LAB(O1P30)-G9/RAV"
                ],
                "9-10AM": [
                    "LC1-C3(D3C10)-CS1/VGU",
                    "LC1-C3(D3C20)-CS2/AV",
                    "LB(D3B30)-CS3/GZL",
                    "LB(D3B50)-CS4/DL",
                    "L(17B1ND3A20)-CS5/AB",
                    "L(15B11D3A50)-CS6/RRJ",
                    "L(24D3A40)-CS7/RHA",
                    "L(24B12D3A10)-CS8/RU",
                    "LB(D3B40)-CR301/PU",
                    "LB(D3B10)-CR325/PK",
                    "LB(D3B20)-CR401/PKAU",
                    "L(17B1ND3A30)-CR425/ABY"
                ],
                "10-11AM": [
                    "LB1,2(CS311)-G4/AMK",
                    "LB3,4(CS311)-CR425/AST",
                    "LB5,6(CS311)-CS1/JAG",
                    "PB10(B15CS311)-CL13/KA,NAC",
                    "PB11(B15CS311)-CL14/AKM,PAR",
                    "PB12(CI573)-CL15/VRN,SHR",
                    "PB14(CI681)-CL17/NSA,PAG",
                    "PA3(15EC315)-VDA/SHA, RMD",
                    "PA4(EC671)-ACL/JG, JYO"
                ],
                "11-12PM": [
                    "LB1,2(CI513)-G4/DCH",
                    "LB3,4(CI513)-CR425/KJ",
                    "LB5,6(CI513)-CS1/RJM",
                    "TA1(EC315)-F10/RHA"
                ],
                "12-1PM": [
                    "LUNCH"
                ],
                "1-2PM": [
                    "TC2,C3(BT611)-TS6/VBR, CKJ",
                    "LB(CI514)-G4/ASA"
                ],
                "2-3PM": [
                    "L(16B19V1A10)-FF3/NSH",
                    "LABC(V1H10)-FF4/HK",
                    "LC1-C3(V1C10)-CS1/MAS,MOB",
                    "LC1-C3(16V2C20)-CS2/RPS",
                    "LABC(V1H20)-CS3/EKS",
                    "LAB(13V1P10)-G4/ABH",
                    "PB1-9(V1B20)-CL09/ AA,BS",
                    "PB10,11,12,14,15(V1B20)-CL22/APJ,AM",
                    "PA1-8,10,C1,3(V1B30)-CL01/AJP,PRV",
                    "PB1-7(V1B30)-CL02/TKT,AMS",
                    "PB8-12,14,15(V1B30)-CL03/AST, TNV",
                    "PB7,9,12,14,15(V1B10)-CL05/AV, KP",
                    "PB2-6,8,11(V1B10)-CL06/AKT, KM",
                    "PA1-5,7,10(V1B10)-CL07/SMT,GZL",
                    "PA6,8,B1,10,C1-2(V1B10)-CL21/MSH,ALK",
                    "PA1-8,C1(V1B40)-CL10/SHO,ROH",
                    "PB1-5,9-12,14,15(V1B40)-CL11/SHG,AW",
                    "PB6,7,8(V1B40)-CL13/VIV,TRN",
                    "PA1-5,10(V1B20)-CL14/SVS,NEH",
                    "PA6,7,8,C1,2(V1B20)-CL15/JAG, KJ"
                ],
                "3-4PM": [
                    "LAB(13V1P10)-G4/ABH"
                ],
                "4-5PM": [],
                "5-6PM": []
            },
            "FRI": {
                "8-9AM": [
                    "LC1-C3(D2C10)-CS1ANM",
                    "LC1-C3(D2C20)-CS2/SMO",
                    "L(D2A20)-CS3/PKY",
                    "LB(D2B30)-CS4/SON",
                    "LB2-9(D2B10)-CS5/SHP",
                    "L(17B11D2A10)-CS6/SMK",
                    "L(D2A40)-CS7/VKH",
                    "L(D2A30)-CS8/SHI",
                    "LB(D2B40)-CR301/VIK",
                    "LB(D2B20)-CR325/SYN",
                    "LB1,10-12,14,15(D2B10)-CR401/SHV"
                ],
                "9-10AM": [
                    "LABC (H3H70)-CS1/MSU",
                    "LABC (H3H50)-CS2/NAM",
                    "LABC (H3H60)-CS3/KMB",
                    "LA1-A10, B11-B15, C1-C3(H3H20) -CS4/MB",
                    "LB1-B10 (H3H20) -CS5/PAC",
                    "LABC (H3H40)-CS6/PSH",
                    "LABC (H3H30)-CS7/IJ",
                    "LABC (H3H80)-CS8/VSE",
                    "LABC (H3H90)-CR301/MRB",
                    "LA1-A10, B11-B15 (H3H10)-CR325/AMN",
                    "LB1-B10,C1-C3 (H3H10)-CR525/SDA"
                ],
                "10-11AM": [
                    "LB14,15(CI521)-G4/KSA",
                    "LB7,8(CS311)-CS1/NAC",
                    "LB9,10(CS311)-CS2/KA",
                    "LA1-A2(EC315)-CS3/SHA",
                    "LB11,12(CS311)-CR425/AKM",
                    "LA3-A4(EC315)-G7/AKS",
                    "PA7(EC671)-ACL/JG, TA",
                    "PA6(15EC315)-VDA/SCH, ATA",
                    "PB4(CI573)-CL21/IC,PRK",
                    "PB5(CI573)-CL22/VRN,SHR",
                    "PB6(CI573)-Cl23/ATI,KJ",
                    "PC1 (BT671)-BT1/VBR, PC, NV, ANM",
                    "PC2,C3(BT474)-BT2/RAC, SHM, RG, MAS"
                ],
                "11-12PM": [
                    "LA1-A2(EC611)-G8/AB",
                    "LB14,15(CI621)-G4/NSA,PAG",
                    "LB7,8(CI513)-CS1/RCA",
                    "LB9,10(CI513)-CS2/RTK",
                    "LB(CI514)-CS3/ASA",
                    "LB11,12(CI513)-CR425/AKT",
                    "LA3-A4(EC611)-G7/AMR"
                ],
                "12-1PM": [
                    "LUNCH"
                ],
                "1-2PM": [
                    "LB1,2(CS311)-G4/AMK",
                    "LB3,4(CS311)-CR425/AST",
                    "LB5,6(CS311)-CS1/JAG",
                    "LAC(V1B10)-CS2/VS",
                    "LAC(V1B20)-CS3/SVS",
                    "TC1(BT611)-TS6/VBR, CKJ",
                    "TB7(CI513)-TR302/DCH",
                    "TB8(CI513)-TR305/KJ",
                    "TB9(CI513)-TR524/RCA"
                ],
                "2-3PM": [
                    "PA10(15EC315)-VDA/AKS, MN",
                    "PA5(EC671)-ACL/NSH, TA",
                    "Lecture and tutorial classes are blocked for talks."
                ],
                "3-4PM": [
                    "LB1,2(CI513)-G4/DCH",
                    "LB3,4(CI513)-CR425/KJ",
                    "LB5,6(CI513)-CS1/RJM",
                    "TB10(CI513)-TR302/AKT",
                    "TB11(CI513)-TR305/RCA",
                    "TB12(CI513)-TR524/RTK",
                    "TB7-12(CI574)-TS20/ASA",
                    "TA6(EC315)-F10/SCH"
                ],
                "4-5PM": [],
                "5-6PM": []
            },
            "SAT": {
                "8-9AM": [
                    "8-9AM",
                    "LC1-C3(D3C10)-CS1/VGU",
                    "LC1-C3(D3C20)-CS2/AV",
                    "T B1-B15 (H3H30)-FF1/IJ",
                    "TB1-B6 (H3H10)-FF2/AMN",
                    "TB7-B15 (H3H10)-FF3/SDA",
                    "TB1-B15 (H3H80)-FF4/VSE",
                    "TB1-B15(H3H60)-FF5/KMB",
                    "TB8-B15 (H3H20) -FF6/PAC",
                    "TB1-B15 (H3H90)-FF7/MRB",
                    "TB1-B15(H3H40)-FF8/PSH",
                    "TB1-B15(H3H50)-FF9/NAM",
                    "TB1-B15 (H3H70)-G1/MSU",
                    "TB1-B7(H3H20) -G2/MB"
                ],
                "9-10AM": [
                    "9-10AM",
                    "LAB(O1P10)-G4/BCJ",
                    "LAB(O1P30)-G9/RAV",
                    "LAB(O1M40)-CS1/NSK",
                    "LAB(O1M30)-CS2/RSH",
                    "LABC(O1M20)-CS3/ATI",
                    "LAB(O1M10)-CS4/NS",
                    "LABC(O1H10)-CS5/MDU",
                    "LABC(O1H20)-CS6/YN",
                    "L(24B12O1A20)-CS7/MNA",
                    "L(24B12O1A10)-CS8/RIG",
                    "LABC(O1P40)-CR301/VBH",
                    "LAB(O1P50)-CR325/INC",
                    "LAB(O1P20)-CR425/MTR"
                ],
                "10-11AM": [
                    "10-11AM",
                    "PA10(EC671)-ACL/NSH, ACH",
                    "LA3-A4(EC315)-CS2/AKS",
                    "PB14(CI581)-CL21/SOS,PK",
                    "PB15(CI581)-Cl22/KSA,NAC",
                    "TB1(CI513)-TR302/RJM",
                    "TB2(CI513)-TR305/KJ",
                    "TB3(CI513)-TR524/RTK",
                    "TB1-6(CI574)-TS20/ASA",
                    "LC1-C3(BT414)-FF1/RAC,SHM"
                ],
                "11-12PM": [
                    "11-12PM",
                    "PA8(15EC315)-VDA/SHA, ATA",
                    "LA3-A4(EC611)-CS3/AMR",
                    "TB4(CI513)-TR302/AKT",
                    "TB5(CI513)-TR305/DCH",
                    "TB6(CI513)-TR524/RJM",
                    "TB6(CI513)-TR524/RJM",
                    "LC1-C3(BT611)-FF1/VBR, CKJ"
                ],
                "12-1PM": [
                    "12-1PM",
                    "LUNCH"
                ],
                "1-2PM": [
                    "1-2PM"
                ],
                "2-3PM": [
                    "2-3PM",
                    ""
                ],
                "3-4PM": [
                    "3-4PM"
                ],
                "4-5PM": [
                    "4-5PM"
                ],
                "5-6PM": [
                    "5-6PM"
                ]
            }
        },
        "subjects": [
            {
                "Code": "O1P30",
                "Full Code": "16B1NPH632",
                "Subject": "SOLID STATE ELECTRONIC DEVICES"
            },
            {
                "Code": "O1M30",
                "Full Code": "20B12MA311",
                "Subject": "APPLICATIONAL ASPECTS OF DIFFERENTIAL EQUATIONS"
            },
            {
                "Code": "O1P10",
                "Full Code": "16B1NPH633",
                "Subject": "PHOTOVOLTAIC TECHNIQUES"
            },
            {
                "Code": "O1M20",
                "Full Code": "16B1NMA633",
                "Subject": "STATISTICS"
            },
            {
                "Code": "O1P40",
                "Full Code": "16B1NPH636",
                "Subject": "MEDICAL AND INDUSTRIAL APPLICATIONS OF NUCLEAR RADIATIONS"
            },
            {
                "Code": "O1M10",
                "Full Code": "18B12MA611",
                "Subject": "OPERATIONS RESEARCH"
            },
            {
                "Code": "O1P50",
                "Full Code": "16B1NPH634",
                "Subject": "APPLIED STATISTICAL MECHANICS"
            },
            {
                "Code": "O1M40",
                "Full Code": "18B12MA612",
                "Subject": "APPLIED MATHEMATICAL METHODS"
            },
            {
                "Code": "O1P20",
                "Full Code": "23B12PH311",
                "Subject": "Waste to Energy Conversion"
            },
            {
                "Code": "BT414",
                "Full Code": "15B11BT414",
                "Subject": "Immunology"
            },
            {
                "Code": "V1P10",
                "Full Code": "21B13PH311",
                "Subject": "Rechargeable Battery Science and Technology"
            },
            {
                "Code": "BT474",
                "Full Code": "15B17BT474",
                "Subject": "Immunology Lab"
            },
            {
                "Code": "EC611",
                "Full Code": "15B11EC611",
                "Subject": "Telecommunication Networks"
            },
            {
                "Code": "BT611",
                "Full Code": "15B11BT611",
                "Subject": "Comparative and Functional Genomics"
            },
            {
                "Code": "EC315",
                "Full Code": "18B11EC315",
                "Subject": "VLSI Design"
            },
            {
                "Code": "BT671",
                "Full Code": "15B17BT671",
                "Subject": "Comparative and Functional Genomics Lab"
            },
            {
                "Code": "EC671",
                "Full Code": "15B17EC671",
                "Subject": "Telecommunication Networks Lab"
            },
            {
                "Code": "15EC315",
                "Full Code": "18B15EC315",
                "Subject": "VLSI Design Lab II"
            },
            {
                "Code": "D2C10",
                "Full Code": "16B1NBT631",
                "Subject": "BIOECONOMICS"
            },
            {
                "Code": "D2A10",
                "Full Code": "17B11EC731",
                "Subject": "MOBILE COMMUNICATION"
            },
            {
                "Code": "D2C20",
                "Full Code": "16B1NBT634",
                "Subject": "GENETIC DISORDERS AND PERSONALIZED MEDICINE"
            },
            {
                "Code": "D2A20",
                "Full Code": "18B12EC311",
                "Subject": "ADVANCED RADIO ACCESS NETWORKS"
            },
            {
                "Code": "D2A30",
                "Full Code": "23B12EC311",
                "Subject": "Semiconductor Devices and Circuits"
            },
            {
                "Code": "D2A40",
                "Full Code": "18B13EC314",
                "Subject": "MACHINE LEARNING FOR SIGNAL PROCESSING"
            },
            {
                "Code": "D3C10",
                "Full Code": "16B1NBT632",
                "Subject": "ANTIMICROBIAL RESISTANCE"
            },
            {
                "Code": "D3A10",
                "Full Code": "24B12EC411",
                "Subject": "Fundamentals of Electric Vehicle"
            },
            {
                "Code": "D3C20",
                "Full Code": "24B12BT311",
                "Subject": "Environmental Bioengineering"
            },
            {
                "Code": "D3A20",
                "Full Code": "17B1NEC741",
                "Subject": "DIGITAL HARDWARE DESIGN"
            },
            {
                "Code": "D3A30",
                "Full Code": "17B1NEC734",
                "Subject": "RF AND MICROWAVE ENGINEERING"
            },
            {
                "Code": "D3A40",
                "Full Code": "24B12EC315",
                "Subject": "Introduction to FPGA Design"
            },
            {
                "Code": "V1C10",
                "Full Code": "21B13BT311",
                "Subject": "BIORISK AND BIOSECURITY"
            },
            {
                "Code": "D3A50",
                "Full Code": "15B11EC613",
                "Subject": "CONTROL SYSTEMS"
            },
            {
                "Code": "V2C20",
                "Full Code": "24B13BT311",
                "Subject": "Scientific writing and Communication"
            },
            {
                "Code": "O1A10",
                "Full Code": "24B12EC312",
                "Subject": "Introduction to Information Theory"
            },
            {
                "Code": "O1A20",
                "Full Code": "24B12EC311",
                "Subject": "Artificial Intelligence"
            },
            {
                "Code": "CS311",
                "Full Code": "18B11CS311",
                "Subject": "COMPUTER NETWORKS AND IOT"
            },
            {
                "Code": "V1A10",
                "Full Code": "16B19EC691",
                "Subject": "RENEWABLE ENERGY"
            },
            {
                "Code": "CI521",
                "Full Code": "15B22CI521",
                "Subject": "CLOUD BASED ENTERPRISE SYSTEM"
            },
            {
                "Code": "CI513",
                "Full Code": "15B11CI513",
                "Subject": "SOFTWARE ENGINEERING"
            },
            {
                "Code": "H3H10",
                "Full Code": "21B12HS311",
                "Subject": "Development Issues and Rural Engineering"
            },
            {
                "Code": "CI514",
                "Full Code": "15B11CI514",
                "Subject": "ARTIFICIAL INTELLIGENCE"
            },
            {
                "Code": "H3H20",
                "Full Code": "16B1NHS636",
                "Subject": "LITERATURE AND ADAPTION"
            },
            {
                "Code": "CI621",
                "Full Code": "15B22CI621",
                "Subject": "DATA MINING AND WEB ALGOTITHM"
            },
            {
                "Code": "H3H30",
                "Full Code": "20B12HS311",
                "Subject": "GLOBAL POLITICS"
            },
            {
                "Code": "B15CS311",
                "Full Code": "18B15CS311",
                "Subject": "COMPUTER NETWORKS AND IOT LAB"
            },
            {
                "Code": "H3H40",
                "Full Code": "24B12HS311",
                "Subject": "Investment Management"
            },
            {
                "Code": "CI581",
                "Full Code": "15B28CI581",
                "Subject": "CLOUD BASED ENTERPRISE SYSTEM LAB"
            },
            {
                "Code": "H3H50",
                "Full Code": "24B12HS313",
                "Subject": "Political Philosophy"
            },
            {
                "Code": "CI573",
                "Full Code": "15B17CI573",
                "Subject": "SOFTWARE ENGINEERING LAB"
            },
            {
                "Code": "H3H60",
                "Full Code": "15B1NHS831",
                "Subject": "EFFECTIVE TOOLS FOR CAREER MANAGEMENT AND DEVELOPMENT"
            },
            {
                "Code": "CI574",
                "Full Code": "15B17CI574",
                "Subject": "ARTIFICIAL INTELLIGENCE LAB"
            },
            {
                "Code": "H3H70",
                "Full Code": "18B12HS611",
                "Subject": "MARKETING MANAGEMENT"
            },
            {
                "Code": "CI681",
                "Full Code": "15B28CI681",
                "Subject": "DATA MINING AND WEB ALGOTITHM LAB"
            },
            {
                "Code": "H3H80",
                "Full Code": "19B12HS613",
                "Subject": "INTERNATIONAL TRADE & FINANCE"
            },
            {
                "Code": "D2B10",
                "Full Code": "21B12CS315",
                "Subject": "Web Technology and Cyber Security"
            },
            {
                "Code": "H3H90",
                "Full Code": "19B12HS611",
                "Subject": "ECONOMETRIC ANALYSIS"
            },
            {
                "Code": "D2B20",
                "Full Code": "21B12CS319",
                "Subject": "Fundamentals of Soft Computing"
            },
            {
                "Code": "O1H10",
                "Full Code": "24B12HS316",
                "Subject": "Popular Literature"
            },
            {
                "Code": "D2B30",
                "Full Code": "21B12CS314",
                "Subject": "Introduction to Large Scale Database Systems"
            },
            {
                "Code": "O1H20",
                "Full Code": "21B12HS411",
                "Subject": "Urban Sociology"
            },
            {
                "Code": "D2B40",
                "Full Code": "21B12CS312",
                "Subject": "Sensor Technology & Android Programming"
            },
            {
                "Code": "V1H10",
                "Full Code": "24B16HS311",
                "Subject": "Basics of Creative Writing"
            },
            {
                "Code": "D3B10",
                "Full Code": "21B12CS313",
                "Subject": "Fundamentals of Distributed and Cloud Computing"
            },
            {
                "Code": "V1H20",
                "Full Code": "23B18HS311",
                "Subject": "Workplace Communication"
            },
            {
                "Code": "D3B20",
                "Full Code": "21B12CS320",
                "Subject": "Open source software development"
            },
            {
                "Code": "D3B30",
                "Full Code": "21B12CS317",
                "Subject": "Introduction to Blockchain Technology"
            },
            {
                "Code": "D3B40",
                "Full Code": "21B12CS318",
                "Subject": "Big Data Ingestion"
            },
            {
                "Code": "D3B50",
                "Full Code": "21B12CS321",
                "Subject": "Concepts of Graph theory"
            },
            {
                "Code": "V1B10",
                "Full Code": "20B16CS323",
                "Subject": "PROBLEM SOLVING USING C AND C++"
            },
            {
                "Code": "V1B20",
                "Full Code": "20B16CS326",
                "Subject": "FRONT END PROGRAMMING"
            },
            {
                "Code": "V1B30",
                "Full Code": "20B16CS322",
                "Subject": "JAVA PROGRAMMING"
            },
            {
                "Code": "V1B40",
                "Full Code": "20B16CS324",
                "Subject": "NON LINEAR DATA STRUCTURES & PROBLEM SOLVING"
            }
        ]
    }
}

export default mapping