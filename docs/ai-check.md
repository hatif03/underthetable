# Independent reading of press records by a language model

Produced by `npm run ai:check`. A model read each cited article and answered one question: does this article support this claim? It decides nothing and writes nothing to Arkiv. "Unreadable" means the page could not be fetched; it is never agreement.

| Record | Source | Model says | Problems it found | Its severity | Ours |
| --- | --- | --- | --- | --- | --- |
| chs-w42-garbage | Free Press Journal | error | The model did not return a verdict | | |
| edl-w42-garbage | Amar Ujala | error | The model did not return a verdict | | |
| usn-w42-pothole | Amar Ujala | yes | none | 3 | 3 |
| nai-w42-pothole | Amar Ujala | error | The model did not return a verdict | | |
| son-w42-streetlight | Amar Ujala | error | The model did not return a verdict | | |
| hap-w41-doctors | Amar Ujala | yes | none | 3 | 3 |
| ayo-w41-doctors | Amar Ujala | error | The model did not return a verdict | | |
| fth-w40-medicine | Amar Ujala | yes | none | 3 | 3 |
| sit-w42-teachers | Amar Ujala | yes | none | 3 | 3 |
| dha-w42-meal | ETV Bharat | error | The model did not return a verdict | | |
