const curriculumData = {
    "total_disciplines": 81,
    "disciplines": [
        {
            "id": "D01",
            "recommendedSemester": 1,
            "name": "Língua Inglesa I",
            "type": "Obrigatória",
            "workload": 80,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": []
            }
        },
        {
            "id": "D02",
            "recommendedSemester": 1,
            "name": "Introdução à Linguística",
            "type": "Obrigatória",
            "workload": 80,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": []
            }
        },
        {
            "id": "D03",
            "recommendedSemester": 1,
            "name": "Fonética e Fonologia do Português I",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": []
            }
        },
        {
            "id": "D04",
            "recommendedSemester": 1,
            "name": "Teoria da Literatura",
            "type": "Obrigatória",
            "workload": 80,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": []
            }
        },
        {
            "id": "D05",
            "recommendedSemester": 1,
            "name": "História da Educação",
            "type": "Obrigatória",
            "workload": 80,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": []
            }
        },
        {
            "id": "D06",
            "recommendedSemester": 1,
            "name": "Metodologia de Pesquisa",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": []
            }
        },
        {
            "id": "D07",
            "recommendedSemester": 2,
            "name": "Língua Inglesa II",
            "type": "Obrigatória",
            "workload": 80,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D01"
                    }
                ]
            }
        },
        {
            "id": "D08",
            "recommendedSemester": 2,
            "name": "Fonética e Fonologia do Português II",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D03"
                    }
                ]
            }
        },
        {
            "id": "D09",
            "recommendedSemester": 2,
            "name": "Literatura Brasileira I",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D04"
                    }
                ]
            }
        },
        {
            "id": "D10",
            "recommendedSemester": 2,
            "name": "Literatura Portuguesa I",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D04"
                    }
                ]
            }
        },
        {
            "id": "D11",
            "recommendedSemester": 2,
            "name": "Educação Inclusiva",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": []
            }
        },
        {
            "id": "D12",
            "recommendedSemester": 2,
            "name": "Psicologia do Desenvolvimento",
            "type": "Obrigatória",
            "workload": 80,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": []
            }
        },
        {
            "id": "D13",
            "recommendedSemester": 2,
            "name": "Fundamentos Sociofilosóficos da Educação",
            "type": "Obrigatória",
            "workload": 80,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": []
            }
        },
        {
            "id": "D14",
            "recommendedSemester": 3,
            "name": "Língua Inglesa III",
            "type": "Obrigatória",
            "workload": 80,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D07"
                    }
                ]
            }
        },
        {
            "id": "D15",
            "recommendedSemester": 3,
            "name": "Linguística Textual",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D02"
                    }
                ]
            }
        },
        {
            "id": "D16",
            "recommendedSemester": 3,
            "name": "Língua Portuguesa – Morfossintaxe I",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D02"
                    }
                ]
            }
        },
        {
            "id": "D17",
            "recommendedSemester": 3,
            "name": "Literatura Brasileira II",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D09"
                    }
                ]
            }
        },
        {
            "id": "D18",
            "recommendedSemester": 3,
            "name": "Literatura Portuguesa II",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D10"
                    }
                ]
            }
        },
        {
            "id": "D19",
            "recommendedSemester": 3,
            "name": "Psicologia da Aprendizagem",
            "type": "Obrigatória",
            "workload": 80,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D12"
                    }
                ]
            }
        },
        {
            "id": "D20",
            "recommendedSemester": 3,
            "name": "Didática",
            "type": "Obrigatória",
            "workload": 80,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D13"
                    }
                ]
            }
        },
        {
            "id": "D21",
            "recommendedSemester": 4,
            "name": "Língua Inglesa IV",
            "type": "Obrigatória",
            "workload": 80,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D14"
                    }
                ]
            }
        },
        {
            "id": "D22",
            "recommendedSemester": 4,
            "name": "Literatura Portuguesa III",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D18"
                    }
                ]
            }
        },
        {
            "id": "D23",
            "recommendedSemester": 4,
            "name": "Literatura Brasileira III",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D17"
                    }
                ]
            }
        },
        {
            "id": "D24",
            "recommendedSemester": 4,
            "name": "Língua Portuguesa – Morfossintaxe II",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D16"
                    }
                ]
            }
        },
        {
            "id": "D25",
            "recommendedSemester": 4,
            "name": "TICs aplicadas ao ensino",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": []
            }
        },
        {
            "id": "D26",
            "recommendedSemester": 4,
            "name": "Política e Gestão Educacional",
            "type": "Obrigatória",
            "workload": 80,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D13"
                    }
                ]
            }
        },
        {
            "id": "D27",
            "recommendedSemester": 4,
            "name": "Currículo e Práticas Educativas",
            "type": "Obrigatória",
            "workload": 80,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D13"
                    }
                ]
            }
        },
        {
            "id": "D28",
            "recommendedSemester": 5,
            "name": "Língua Inglesa V",
            "type": "Obrigatória",
            "workload": 80,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D21"
                    }
                ]
            }
        },
        {
            "id": "D29",
            "recommendedSemester": 5,
            "name": "Fonética e Fonologia do Inglês I",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D08"
                    }
                ]
            }
        },
        {
            "id": "D30",
            "recommendedSemester": 5,
            "name": "Teoria da Tradução",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D14"
                    }
                ]
            }
        },
        {
            "id": "D31",
            "recommendedSemester": 5,
            "name": "Língua Latina – Latim I",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D24"
                    }
                ]
            }
        },
        {
            "id": "D32",
            "recommendedSemester": 5,
            "name": "Literatura Brasileira IV",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D23"
                    }
                ]
            }
        },
        {
            "id": "D33",
            "recommendedSemester": 5,
            "name": "Estágio Supervisionado I – Língua Portuguesa",
            "type": "Obrigatória",
            "workload": 80,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D20"
                    }
                ]
            }
        },
        {
            "id": "D34",
            "recommendedSemester": 5,
            "name": "Projetos Sociais",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": []
            }
        },
        {
            "id": "D35",
            "recommendedSemester": 6,
            "name": "Língua Inglesa VI",
            "type": "Obrigatória",
            "workload": 80,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D28"
                    }
                ]
            }
        },
        {
            "id": "D36",
            "recommendedSemester": 6,
            "name": "Fonética e Fonologia do Inglês II",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D29"
                    }
                ]
            }
        },
        {
            "id": "D37",
            "recommendedSemester": 6,
            "name": "Compreensão e análise de texto em L. Inglesa",
            "type": "Obrigatória",
            "workload": 80,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D28"
                    }
                ]
            }
        },
        {
            "id": "D38",
            "recommendedSemester": 6,
            "name": "Língua Latina – Latim II",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D31"
                    }
                ]
            }
        },
        {
            "id": "D39",
            "recommendedSemester": 6,
            "name": "História da Cultura Indígena e Afro-Brasileira",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": []
            }
        },
        {
            "id": "D40",
            "recommendedSemester": 6,
            "name": "Literatura Cearense",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D04"
                    }
                ]
            }
        },
        {
            "id": "D41",
            "recommendedSemester": 6,
            "name": "Estágio Supervisionado II – Língua Portuguesa",
            "type": "Obrigatória",
            "workload": 80,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D33"
                    }
                ]
            }
        },
        {
            "id": "D42",
            "recommendedSemester": 7,
            "name": "Tradução da Língua Inglesa",
            "type": "Obrigatória",
            "workload": 80,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D30"
                    }
                ]
            }
        },
        {
            "id": "D43",
            "recommendedSemester": 7,
            "name": "Morfossintaxe da Língua Inglesa",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D21"
                    }
                ]
            }
        },
        {
            "id": "D44",
            "recommendedSemester": 7,
            "name": "Literatura Africana de Língua Portuguesa",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D04"
                    }
                ]
            }
        },
        {
            "id": "D45",
            "recommendedSemester": 7,
            "name": "Pesquisa Científica",
            "type": "Obrigatória",
            "workload": 80,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D06"
                    }
                ]
            }
        },
        {
            "id": "D46",
            "recommendedSemester": 7,
            "name": "Estágio Supervisionado III – Língua Portuguesa",
            "type": "Obrigatória",
            "workload": 80,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D41"
                    }
                ]
            }
        },
        {
            "id": "D47",
            "recommendedSemester": 7,
            "name": "Estágio Supervisionado I – Língua Inglesa",
            "type": "Obrigatória",
            "workload": 80,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D35"
                    }
                ]
            }
        },
        {
            "id": "D48",
            "recommendedSemester": 8,
            "name": "Literatura de Língua Inglesa I",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D35"
                    }
                ]
            }
        },
        {
            "id": "D49",
            "recommendedSemester": 8,
            "name": "Literatura Comparada",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D04"
                    }
                ]
            }
        },
        {
            "id": "D50",
            "recommendedSemester": 8,
            "name": "Linguística Aplicada",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D02"
                    }
                ]
            }
        },
        {
            "id": "D51",
            "recommendedSemester": 8,
            "name": "Sociolinguística",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D02"
                    }
                ]
            }
        },
        {
            "id": "D52",
            "recommendedSemester": 8,
            "name": "Educação Popular",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": []
            }
        },
        {
            "id": "D53",
            "recommendedSemester": 8,
            "name": "Estágio Supervisionado IV – Língua Portuguesa",
            "type": "Obrigatória",
            "workload": 80,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D46"
                    }
                ]
            }
        },
        {
            "id": "D54",
            "recommendedSemester": 8,
            "name": "Estágio Supervisionado II – Língua Inglesa",
            "type": "Obrigatória",
            "workload": 80,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D47"
                    }
                ]
            }
        },
        {
            "id": "D55",
            "recommendedSemester": 8,
            "name": "Trabalho de Conclusão de Curso – TCC 1",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D45"
                    }
                ]
            }
        },
        {
            "id": "D56",
            "recommendedSemester": 9,
            "name": "Literatura de Língua Inglesa II",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D48"
                    }
                ]
            }
        },
        {
            "id": "D57",
            "recommendedSemester": 9,
            "name": "Literatura Infanto-Juvenil",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D04"
                    }
                ]
            }
        },
        {
            "id": "D58",
            "recommendedSemester": 9,
            "name": "Linguística (Cognitiva e Psicolinguística)",
            "type": "Obrigatória",
            "workload": 80,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D02"
                    }
                ]
            }
        },
        {
            "id": "D59",
            "recommendedSemester": 9,
            "name": "Introdução ao Estudo de Libras",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": []
            }
        },
        {
            "id": "D60",
            "recommendedSemester": 9,
            "name": "Estágio Supervisionado V – Língua Portuguesa",
            "type": "Obrigatória",
            "workload": 80,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D53"
                    }
                ]
            }
        },
        {
            "id": "D61",
            "recommendedSemester": 9,
            "name": "Estágio Supervisionado III – Língua Inglesa",
            "type": "Obrigatória",
            "workload": 80,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D54"
                    }
                ]
            }
        },
        {
            "id": "D62",
            "recommendedSemester": 9,
            "name": "Trabalho de Conclusão de Curso – TCC 2",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D55"
                    }
                ]
            }
        },
        {
            "id": "D63",
            "recommendedSemester": 10,
            "name": "Literatura de Língua Inglesa III",
            "type": "Obrigatória",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D56"
                    }
                ]
            }
        },
        {
            "id": "D64",
            "recommendedSemester": 10,
            "name": "Estágio Supervisionado IV – Língua Inglesa",
            "type": "Obrigatória",
            "workload": 80,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D61"
                    }
                ]
            }
        },
        {
            "id": "D65",
            "recommendedSemester": 0,
            "name": "Módulo Avançado em Língua Inglesa",
            "type": "Optativa",
            "workload": 80,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D35"
                    }
                ]
            }
        },
        {
            "id": "D66",
            "recommendedSemester": 0,
            "name": "Cultura Inglesa I (EUA)",
            "type": "Optativa",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": []
            }
        },
        {
            "id": "D67",
            "recommendedSemester": 0,
            "name": "Cultura Inglesa II (Grã-Bretanha)",
            "type": "Optativa",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": []
            }
        },
        {
            "id": "D68",
            "recommendedSemester": 0,
            "name": "Teoria do Verso",
            "type": "Optativa",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D04"
                    }
                ]
            }
        },
        {
            "id": "D69",
            "recommendedSemester": 0,
            "name": "Semiótica",
            "type": "Optativa",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D02"
                    }
                ]
            }
        },
        {
            "id": "D70",
            "recommendedSemester": 0,
            "name": "Leitura e Produção de Textos Acadêmicos",
            "type": "Optativa",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D02"
                    }
                ]
            }
        },
        {
            "id": "D71",
            "recommendedSemester": 0,
            "name": "Leitura de Textos Acadêmicos em Espanhol",
            "type": "Optativa",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": []
            }
        },
        {
            "id": "D72",
            "recommendedSemester": 0,
            "name": "Estilística",
            "type": "Optativa",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D02"
                    }
                ]
            }
        },
        {
            "id": "D73",
            "recommendedSemester": 0,
            "name": "Educação Física",
            "type": "Optativa",
            "workload": 80,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": []
            }
        },
        {
            "id": "D74",
            "recommendedSemester": 0,
            "name": "Gestão Escolar",
            "type": "Optativa",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "OR",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D13"
                    },
                    {
                        "type": "discipline",
                        "disciplineId": "D26"
                    }
                ]
            }
        },
        {
            "id": "D75",
            "recommendedSemester": 0,
            "name": "Introdução à EAD",
            "type": "Optativa",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D27"
                    }
                ]
            }
        },
        {
            "id": "D76",
            "recommendedSemester": 0,
            "name": "Educação Profissional no Brasil",
            "type": "Optativa",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D27"
                    }
                ]
            }
        },
        {
            "id": "D77",
            "recommendedSemester": 0,
            "name": "Educação de Jovens e Adultos (EJA)",
            "type": "Optativa",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D27"
                    }
                ]
            }
        },
        {
            "id": "D78",
            "recommendedSemester": 0,
            "name": "Gramática da Língua Inglesa I",
            "type": "Complementar",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D01"
                    }
                ]
            }
        },
        {
            "id": "D79",
            "recommendedSemester": 0,
            "name": "Gramática da Língua Inglesa II",
            "type": "Complementar",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D07"
                    }
                ]
            }
        },
        {
            "id": "D80",
            "recommendedSemester": 0,
            "name": "Gramática da Língua Inglesa III",
            "type": "Complementar",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D14"
                    }
                ]
            }
        },
        {
            "id": "D81",
            "recommendedSemester": 0,
            "name": "Gramática da Língua Inglesa IV",
            "type": "Complementar",
            "workload": 40,
            "workload_unit": "h",
            "offering": {
                "frequency": "annual",
                "periods": [1]
            },
            "prerequisites": {
                "type": "group",
                "operator": "AND",
                "items": [
                    {
                        "type": "discipline",
                        "disciplineId": "D21"
                    }
                ]
            }
        }
    ]
}
console.log(curriculumData);
