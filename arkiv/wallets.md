# Wallets

Four demo accounts for Tiramisu. Private keys stay in `.env` under these names. This file has addresses only.

The slip itself is not limited to one city. Every state and union territory is in the place list. Nashik is only the district the page opens on.

- `SEED_KEY_1`: `0x13398a1803eCa909D909193F1547FfFc1e05eF4F`. First funded account. It also sends test GLM to the other three.
- `SEED_KEY_2`: `0x8b34C95Cda664550C4eb9C4Ba14BB7172D6Ada25`. Second creator. Funded by a transfer, not the faucet.
- `SEED_KEY_3`: `0xa81eef553318368e1c98F851c29521Ab247532aD`. Third creator. Funded by a transfer, not the faucet.
- `FLOOD_KEY`: `0xeE368405802Ca49d38572f88dE24b9ba044F2804`. Fourth creator. Five slips in one Nashik bucket, one voice.

- Checker wallet (`ATTEST_KEY`): `0xabd68359A33fAb9A03Bb706B56272370A011E5b6`. Writes `attestation` entities only. Funded with 0.5 test GLM from `SEED_KEY_1`, tx `0x825273fdff1c429215ccc6f45893bc0520a6b157b744e7d2dde5f23b5d77dc22`.
- Press curator wallet (`PRESS_KEY`): `0xC26DEbe828cd500c6d31F184BaeCce2782847eA3`. Writes `source = press` reports only (26 on 16 October 2026 and 47 more on 17 October for incidents dated 2 to 17 October, 73 in all, 11 of them with a map pin; keys and transactions in [docs/press-records.md](../docs/press-records.md) and `arkiv/press-progress.json`). Funded with 0.5 test GLM from `SEED_KEY_1`, tx `0x9d892760f8edeaa9ddada16e9fd336d8fad5c12a829f0fa07be37aaad54ad10b`.
- `FLOOD_KEY` also wrote the one demo map pin (a pothole in Nashik, entity `0x311025de…8ab8`, `npm run seed:pin`).
- More server wallets (17 October 2026), so one wallet is not the only one paying or vouching: faucet `DRIP_KEY_2` `0xfaD126048f668816aE3E91b4567770494D7a3f16` and `DRIP_KEY_3` `0x2F5031CB5F05Bd09F09cDc88dB66BcBA11fAd15A` (1 test GLM each; they create no entities), and a second location checker `ATTEST_KEY_2` `0xdD25212Db1C463209fc4bEc3D93f81edCF30d94E` (0.3 test GLM; writes `attestation` entities only and is listed in data/attesters.json).
- `WALLET_TEST_KEY` `0x59171D14942E8597311382d36844Df4611846d8C`: a team wallet that drives `npm run e2e:wallet`, which files one real report through a stand-in browser wallet. The page treats it as a demo wallet.
- Test wallets: three throwaway browser addresses used while testing the filing flow wrote 3 Pune reports and 1 attestation on 16 October 2026; the page treats them as demo rows.
- Faucet wallet (`DRIP_KEY`): `0x0812fed1e90C8d2bff9C3EdB0D3D46CbEf5FA303`. Pays 0.02 test GLM to a visitor's new browser key through `/api/drip`. Funded with 3 test GLM from `SEED_KEY_1`, tx `0x06e83055eca08ec272728adac9650e8ee7d2b4c8cfd2feecb557df948332ee47`. It creates no entities.
- Browser identities: reports filed from the page come from throwaway addresses made in the visitor's browser and funded by `/api/drip`. They are not listed here.

## Transfers

- 1 test GLM to `0x8b34C95Cda664550C4eb9C4Ba14BB7172D6Ada25`, tx `0xdf5913f3e97d99db2286ae653e2d24a4a6f2b00361d909d557579d16cbdd452f`
- 1 test GLM to `0xa81eef553318368e1c98F851c29521Ab247532aD`, tx `0xd09cb914657424826b7bc6b3e771e89ac13e2b82efe22d45dda235cb88ce35d8`
- 1 test GLM to `0xeE368405802Ca49d38572f88dE24b9ba044F2804`, tx `0x7dcf4bd2b7a9c652f668c708943b92ecf218a6dcea9ff068d2abc8bd30e72eb3`

## Entities

- nashik-licence: tx `0xeeebd142ce5f50aca6c5d20fe05b04083d30f55441a7cfe2e7ea2561b3e069c3`, entity `0x8070d5ef45bc22af1dce0ed027ff601e2aef763b6aa2182bf2b3de5052c551a6`
- nashik-pothole: tx `0xffb3f060720c9444b36f43d1352a60b51a93a10dd95fb802ebb87ca85b540fad`, entity `0xbf9a966edc783ca3c22bf9b5191281cf88d90312c6d3f7b6f208f90a160fb968`
- nashik-medicine: tx `0xd0221f465c5b15e9820053365ada5af76fbade276e6b23f0ec663432f29491e9`, entity `0x46131fb1f18d1ffbeec3a4bf7021f2dc945508e953e5042567d0232eb6848b6a`
- nashik-grain: tx `0xa3c30618f801c9a905c1b7ce42830fe4a489b115815ee58f8cb5bd9db4bad1e7`, entity `0x0ee63966a5590083f203313bea5ff0255a0513739a62f39731e4dbdd31a107c6`
- pune-short: tx `0xefc8ee1ae19dd68e803d9c2c5ed094bfa3d480bd6e4b64701d670e575f922348`, entity `0x3922f6cbef9b03c6615eda04510103a4b2992d89693517cef89184ac1c509e18`
- new_delhi-licence-SEED_KEY_1: dl/new_delhi demand driving_licence 500, tx `0x34ed52e7f6c84f3f2ffc0b00d8fb9c0fe795bd12facfabfc575d1baaa5ce5f01`, entity `0x534c1e2c9877e9d12d2a74160f2993a48d2203c1a82ee03467122d30c9cd328a`
- new_delhi-licence-SEED_KEY_2: dl/new_delhi demand driving_licence 800, tx `0x5e0110e5450e97a529981826088ccd908c4def645fe168af99b189b607a211d1`, entity `0xd8dd3e3276830b1525ee043927ba0575a262011b1203136524a41ab83f4409f2`
- new_delhi-licence-SEED_KEY_3: dl/new_delhi demand driving_licence 700, tx `0x5bf244f0c1a4e2fd1c7b3f105626217c1fa22f170a00b32d9a680be9d2f35061`, entity `0x1196537f55f95c52d6bc85852b979e6487f08336d6b6d739bc884c3d1e280d04`
- bengaluru_urban-licence-SEED_KEY_1: ka/bengaluru_urban demand driving_licence 500, tx `0xe06346582b5a1ba8634aea5f0a7a80c9babb2237c1f31c425500504facb7da25`, entity `0x213d178a415243f13147a0e306467f0e3f5ad034ef6315c616d96117092c1815`
- bengaluru_urban-licence-SEED_KEY_2: ka/bengaluru_urban demand driving_licence 800, tx `0x9e054578aae72928d834a22db7c19eb3c6547d19046d72944bae3cb7c84b718b`, entity `0x29ed42664027613579f79daa891b9c9a40f061768eb611a4d5e3f547ca7aa17d`
- bengaluru_urban-licence-SEED_KEY_3: ka/bengaluru_urban demand driving_licence 700, tx `0x82c978d68bb3c9ed7c56cf2a4b6a9ec206534be5cf41beb93c7b921f21736340`, entity `0xbb0349dfd8ec7f6986dbd61030953b26194f874645cf65af62890c4ee5ab60bf`
- chennai-licence-SEED_KEY_1: tn/chennai demand driving_licence 500, tx `0xe3ebf5f3a1bf8ad1c4aba2f963d90d461fb0bd5aa41d98e942ea5aadd142c26f`, entity `0x62fa8eae756987a9ecec3d893b74ebd3b1749a1b5616b8ff9d4c96870fd29b2a`
- chennai-licence-SEED_KEY_2: tn/chennai demand driving_licence 800, tx `0xaee90c161f97aa6a14b552a7182b949fc991765f380c3be80f9843b171888ddc`, entity `0xa7205b9aa374d806a9b519cbf4de113feed230b8c405aaeccb0fd4b35936462d`
- chennai-licence-SEED_KEY_3: tn/chennai demand driving_licence 700, tx `0x4d87ac90919e6d441b8901e41b15fdc0d747461cb9b7b8cb05723e91676189f0`, entity `0x20c8a2ef1a449b9fffb5f1cc421ca52d74a45d9410f1eb1c7d09b7adf75a7825`
- kolkata-licence-SEED_KEY_1: wb/kolkata demand driving_licence 500, tx `0x8ca2ee435db6acf882b6f8167cdb939033298c48df1b59518371b811c6e7769e`, entity `0x460cfa46e76c1de639cc96c80a4098c04762767392577fcac17bc3e0f66c5a9e`
- kolkata-licence-SEED_KEY_2: wb/kolkata demand driving_licence 800, tx `0xc3959351228f9f8a7db62b80ee88269473a8355aeebac8eb6d4fcb06440c48ee`, entity `0x1c63845bd958eaf42ed59668b5783ff629aa6d8875ba35ab96cd94ae0d53229c`
- kolkata-licence-SEED_KEY_3: wb/kolkata demand driving_licence 700, tx `0x9461e04bce82ef9f6d88d96f2d97ac062aba35a88acb7b6d0285332431de11f2`, entity `0x3cf1deca70c11e8ee02f242c3963dd602fe3616cb1f6a11f887f2f01c816b287`
- lucknow-licence-SEED_KEY_1: up/lucknow demand driving_licence 500, tx `0x6faa5c32ce6e639bbca65c9698da39a5e0cffdb4b7546efbb69099d9af533d1c`, entity `0x488297ce84a513e2019c7a7f705dcee80f7f0de4defb8804f2eb8ed4c7b96b76`
- lucknow-licence-SEED_KEY_2: up/lucknow demand driving_licence 800, tx `0xc6199c20a37b7b60520b9769483c5f74904cc45f26ecebf1bed7c24ae444f7d1`, entity `0x35c8bd36a3bbc9caed355e56de120443e73372bc32be3302b345fa5138142c62`
- lucknow-licence-SEED_KEY_3: up/lucknow demand driving_licence 700, tx `0x7d15b887ed41f2fff4d09ad1a391b4456f45afccd03ea3730d772eea033fd0bc`, entity `0xd5545825c195c3c638e7e29525177841aca17792735532232d43531282c533a4`
- ahmedabad-licence-SEED_KEY_1: gj/ahmedabad demand driving_licence 500, tx `0x2f8d3e4b5b991d0957ce2b3f8598a6b83be6a1fb173e73402ba4e4df30391e75`, entity `0xa25947a86f7b7f696e61fef9e5d605fdda56b115accbc2368b4bcaaa1f0e0ecc`
- ahmedabad-licence-SEED_KEY_2: gj/ahmedabad demand driving_licence 800, tx `0xdd1188584f12dd3fffee55d26b55e3af29e00790c7d4476362303201afb386ca`, entity `0x8ba54e3b85ed7f6f5cbb6cdad1db55fb0090ff1d665275bf39f0aa358f61b6a4`
- ahmedabad-licence-SEED_KEY_3: gj/ahmedabad demand driving_licence 700, tx `0x8ebfcb76247c0ca8f7f4a6eb5057c30eda9c8f4591e011b1b114e6897b5d9968`, entity `0x930fc316f27e01fbef0c97d1cc32c06a1becf01b736989370a8ebc5df884c875`
- hyderabad-licence-SEED_KEY_1: tg/hyderabad demand driving_licence 500, tx `0xa76737801d4face1560b18a8192a7e4c4ffedb6187caecd866b37b6f3e3abe7f`, entity `0x4fb41ac01776deb08049d97713c7e41a833da8a891761afd194fde35b96557f1`
- hyderabad-licence-SEED_KEY_2: tg/hyderabad demand driving_licence 800, tx `0xd3fb570bb6e51ef44f58b47a908cec8118e4a3aaf8f295a7334d93810f7b46ff`, entity `0xcedcd2a2446af94de6169ae3572f12ae11a30f215cb555caf4da9b5ad60354e2`
- hyderabad-licence-SEED_KEY_3: tg/hyderabad demand driving_licence 700, tx `0x8c94c209495e5a19154d8241eea95461c592569db670c533b7cd22621d06b466`, entity `0xc5390640b6237c29670e88d20310780f016798a20cc676023069ae0b06b06269`
- patna-licence-SEED_KEY_1: br/patna demand driving_licence 500, tx `0xce9598a97ec86b1b29b659fdc3795239951715af75ac863aea16bca4394b1167`, entity `0xbc5681eb3f030cffecb3a63c949034357b0a79fa278814135dc21af9ac0d4d13`
- patna-licence-SEED_KEY_2: br/patna demand driving_licence 800, tx `0xf2391c227a37375bf9501a0a6b88ec4504d24d56e86ec811d292096014837cb2`, entity `0x33701a78d22fde42d0125f10cde2914eede6971740d4f1908b9cf33d9112f0ad`
- patna-licence-SEED_KEY_3: br/patna demand driving_licence 700, tx `0x6714c38162028b603c0953ccba60ab45a607a62ae85859f4245292e0ff4e3592`, entity `0xda0f1fc7d494dcff0d0019b692c42e5a8eaf05628c70e4105c84f843bb44abe3`
- jaipur-licence-SEED_KEY_1: rj/jaipur demand driving_licence 500, tx `0x583e9acfafc975ac81fca1068c1d3c319575254dbd95c7d3ed22eea3baf0771b`, entity `0x9fe43af52ddb9125de16a8c9db770f87f3c3902af998ab13c5ad4003ba552413`
- jaipur-licence-SEED_KEY_2: rj/jaipur demand driving_licence 800, tx `0xb4f1d6c34e533da1481c024aae2fde33096a4a4b97a0720baba0e51c60b933b2`, entity `0xcee20e27ea0b3e9eb30b64d3afca7b6c8e5724cc8d7bd7c48fe0ca185e7f7d5a`
- jaipur-licence-SEED_KEY_3: rj/jaipur demand driving_licence 700, tx `0x9e835e33736f4408bfcb96978f988758bd31a224fcd12aa36a70b4e705b7a51f`, entity `0x9a5555b454d430733f0e44926cd65fb933915dcbd7bbb7d0cafb4bab27b16242`
- mumbai-licence-SEED_KEY_1: mh/mumbai demand driving_licence 500, tx `0x7da4746e92064fabdae54c7fbd5b81b06a98cb150f06ea3d3e8100fe67a2b82d`, entity `0x55a4e2aa81a186b9ef7fd3c97b0709f1edcef0a1faf08ae63e0c8f5fcc54f2aa`
- mumbai-licence-SEED_KEY_2: mh/mumbai demand driving_licence 800, tx `0x1ec8b0c0b9eccfdf9125ff5d80a8ebb37187d4f0b5f2d5bf6022b30dd491953a`, entity `0x7d35e059cee8570bd120107e8094c1fd95900423ece93478018205953aaf8470`
- mumbai-licence-SEED_KEY_3: mh/mumbai demand driving_licence 700, tx `0x7df8c38d80ef1842f1d8bb3c2b9dd5283b469d155cd86138dbcc05923005f225`, entity `0x1a31dc91b0dd57975e4b2baefd881bfe54e7770902ffba1f1570560d0ad72d78`
- nashik-licence-SEED_KEY_2: mh/nashik demand driving_licence 800, tx `0x5b705c2d5aedf8acf536fd6ab2ae1255619c6a5062aea56de9f084d80ab38e49`, entity `0xbe9962e26a6e79cf968c0e0fa4ffa59acf4285fba56637bd60c16300b5c799da`
- nashik-licence-SEED_KEY_3: mh/nashik demand driving_licence 700, tx `0x37a9d19722ec15340b245136f11e8e615f88246a3dc75a1458831a8943a98d34`, entity `0x4822c735251a4caf758ac063931bc4af63cd2f6bf493525916f20138dde6c292`
- nashik-flood-1: mh/nashik demand driving_licence 1000, tx `0x80797fba906af5df2fb2c67c52c7c17d3656a08285e8278fb1487f24fab72cb7`, entity `0x92f63dc7509f34180a6d3b9829c995f2cd71949be6f8db896b8affbc848d7d32`
- nashik-flood-2: mh/nashik demand driving_licence 50, tx `0xb89730702720abc0aeeaadd52eaef63cbf666bc3b3d83228789d91a394278d08`, entity `0x6349d3bdf0489b7827883723aab9da60148c58a3bfb34bcf7ced1edb01e61a84`
- nashik-flood-3: mh/nashik demand driving_licence 60, tx `0xfdf8f40fa2b49c15de2ef8602760f291433f154642edcd1f665b9a903b09bb7e`, entity `0x19181ef7b252091b5feecce49aa4d86bc819a8f448e6bd99eef3b2f707c98b12`
- nashik-flood-4: mh/nashik demand driving_licence 70, tx `0xd5437deeed8823c2ad2d20c9e9726e1cba9127d5918a854c2b1c042d25360a6f`, entity `0xe7eab8643570ab6911a1b58da90797a40bdc55488cecb2664f0ae5e0748cd4da`
- nashik-flood-5: mh/nashik demand driving_licence 80, tx `0xa52ecbfb1d03d1ad90e102ba326920e99f8e0968b7e23dd0a2f3618364e8a0f3`, entity `0x8aa2ef290cd86484f283635f62c4a384463c4631a90c162f07e12536f6544fe7`
- nashik-pothole-2: mh/nashik failure pothole 3, tx `0x3d50490a1965de95eb685c1bd59d0535081a4cbdebef0471af93f3c53e6afab8`, entity `0xe10b37f873b706e5e96f691c7da7e48b765fd8fcd751567ea514edd346da6228`
- nashik-pothole-3: mh/nashik failure pothole 5, tx `0x410e73e185e27f2eed5a6f8f6cb918317510c31863c1c91b46b219146ab92066`, entity `0xc12b7eedc486842f6b6f44e9a6ea731de023b5bb10b533fce098ce70fcafe11f`
- nashik-medicine-2: mh/nashik absence medicine_missing 2, tx `0x7b725332309acc8932d4a62edf9eb4a6a120deb922bb66b1ec6283d85a57e1f1`, entity `0xfb7ae80f9e6d6279187d351252a8ca7c00389f1ec332e686caf7c1f3f4379fa0`
- nashik-medicine-3: mh/nashik absence medicine_missing 4, tx `0xf73411f16a24c2f77c43fe973365a3ab1c8b1f698f18fc8677d3b7706de8f834`, entity `0x42e8b7891c1aaa45d505201ab94e0906493c42bf3bac4f905ebfbb398268fd33`
- nashik-grain-2: mh/nashik diversion grain_short 3, tx `0x0249803d6876ec2265174b9fca7f526aa5126ddb9b94a15acc7e8fb6aeffe994`, entity `0x873efd3d0a6101dc4cef582e113727f34d6b21f44d9fed2bad17b61b84e191b9`
- nashik-grain-3: mh/nashik diversion grain_short 5, tx `0x93bded461b6b5475163efa13c56db8286176969e0de63a43c94b3d2f78d5613b`, entity `0x2c85e4cb8aa08631685d88cfb36873ef1cda3ef0cb15cddf3a123b6a8a0aa0ab`

A desk is quoted only after 3 different wallets. These examples use the same driving-licence demand in several cities, plus Nashik reports for a broken road, missing medicine, and short grain. The public read budget may still refuse the page until it resets.
