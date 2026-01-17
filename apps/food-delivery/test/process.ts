/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
// load-test.ts
import { randomUUID } from 'crypto';

// =======================
// Giả lập mảng userId
// =======================
const USER_IDS = [
  '276869ed-09af-4de2-90e4-ee64839f751c',
  'd8f2f68f-95e3-41b9-be6b-2cc30cc6ff76',
  'a2970da7-3e5f-4615-afe6-6e2e674dfb3e',
  '137103f8-46d0-4a86-8d41-116b4320239d',
  '77bba592-5d26-4ca1-8e52-acaa2bddaadb',
  '2d3d7061-8ea9-40d3-9bb3-7a54b4a89bda',
  '78aa6440-7fe5-4a32-9016-2ccec60ca21c',
  '7785674b-caba-4050-ba15-96526fd97494',
  '31d6e91f-56f2-4930-a2b5-9001f48e3b5a',
  '1eb88360-afa2-4849-aeb9-76fabc4c8702',
  '422bacb4-8c38-4b07-acfb-20a7519bb005',
  '45217327-5bc8-4e81-9505-58c592ac1c32',
  'f40023df-3e51-4ed0-89b3-5c5e1f199077',
  '34d207e0-a1cd-43b6-98c1-c48fc31e2d62',
  '975e24a3-1cc0-4b3e-b1ea-8efed8ad0c4d',
  '51c83ea2-f47e-434f-9240-4ef6c1b2df6e',
  '6a199dd2-9c42-4c77-8eb5-3374b506aaa3',
  'c701f62e-0d6a-4468-9e37-e981bb288610',
  '3530cb5c-2d53-405d-8837-94758893e07d',
  'bffd4d25-1ea7-40b0-b7cd-a800ed522207',
  'b13865c0-5d68-41c1-a629-49f2d962fc84',
  '3143bf48-20c6-4bd5-8a0c-d43af753d193',
  '9eb69bae-b9fe-4f24-8bae-9b7c26ea7479',
  'b5b0c55c-0d5f-4ec6-917b-4495c51c804a',
  '1e7eabfe-50ae-47ae-a715-ce1bdc294484',
  'b2efd3b6-737b-480b-8233-0ea338330f67',
  'dbaa6cb2-8b2b-4d81-b545-140c91d9354b',
  '0c231679-2189-49c5-98f5-48102bf73ef8',
  'ddde053c-7aca-46b5-a151-8f68103709f4',
  'e6156390-ff5a-4398-a10c-4e05388fb2ab',
  '63d0f0fa-4b4d-44aa-a424-93a287159722',
  '8d24032d-e499-4392-b25f-fc8920d6f21a',
  '2567d7e8-012f-45c0-b67f-f2cc7eaed13a',
  '5739fcde-3aa1-43b9-b51a-5d2a8ba08429',
  'a8cd9b46-7a53-4119-a638-3bd2cf2874ca',
  '6a7c781c-4fd0-4502-ba4f-7ba0be2c5f42',
  '151363d3-978f-44f2-bf19-e3eb4f304744',
  '6456ed97-1cb9-4aee-93a4-1c38f2e15e23',
  '8be29583-d3bf-40cd-9ae2-35e9062f28e2',
  'd17320f5-3f74-42cb-86c8-e5f62b547157',
  '3316a8f5-3ec8-40d9-b077-c1248661484f',
  'e0f04d04-d2f9-4704-8d31-153805c02299',
  '3aa0adb2-57c1-4f5a-8fbc-646971d5657c',
  'f66d1de4-1807-4a46-b0bb-96d8f484cea1',
  'b24dba37-1edf-4307-b379-b5b56d8efbbb',
  'a6688f37-5606-4ae9-a8b4-8f10aa251bc8',
  'cd3a0fc9-d28b-47c0-9948-4138917f3cc3',
  '3125686c-ed0e-45bc-88c4-d74b66815cd8',
  '1cdb77f6-8800-4c3a-bab3-e5136bb40044',
  '60703089-954c-4a78-9120-5a3630d94dd9',
  'b30249a6-6d65-44e2-b588-0b4099121f13',
  'd9cda124-58be-40fe-bad5-72a579a3d3c0',
  '63aef552-087f-4328-b9de-c83784ebf044',
  '37e1a47d-0fec-42a7-aa94-30030ce99a60',
  'ae64fc79-0cd5-44bd-a522-180c227d06db',
  'b13d72be-958e-4865-a050-71a60b10ca03',
  '74d8cf34-82e7-4bed-9d67-0ade5bafdc6d',
  '6741e944-b14c-4950-819e-75c1f6ad0795',
  '9bf3d5db-bfd9-4857-b34c-ff0d71d47b82',
  '32d93d18-76cd-4061-a8aa-fb48c6bb0644',
  '9d9289bd-96e4-4d32-9a16-63ccbb4181a4',
  '3ae9ab60-b983-4323-9129-ffcd5409e132',
  'a9fe0aa6-8438-40ee-81a1-6f7f3c6b031b',
  '142ac627-a5c0-40c0-abf8-67b0b0643add',
  '4c46a8ef-5bea-4323-8fde-190c27233321',
  'dde301e8-17ab-4f88-9b19-4a1794c88698',
  '4791500b-ad0d-4205-ba60-36e99122aa3b',
  'cf53e43c-db96-4fee-8d27-70710559c2f2',
  'b749ae33-4a47-4613-9912-158ea290c4dd',
  '6100ea33-38e7-4e89-989b-06caccf86b33',
  'ab44d770-67c4-42d5-95e1-ef6a5d88e039',
  '1c298269-ddd4-47a8-a0ec-70c697c5d1ee',
  '52a50ef8-53b4-4aca-a1e2-4059b014f89a',
  '704d6a7b-f274-45fa-87da-f5585d4adaf1',
  'f335210c-8112-4014-a77e-6c44abecb117',
  'abcb5481-a419-4936-a688-5ab09bcd0e61',
  'f917a80b-6bbc-4130-a876-6d718a9436cc',
  '359a0c4b-8e0b-4f41-ad51-dafacbe1267f',
  '60f2bf24-d622-481b-83c4-1f18094d8084',
  '5c1fe407-263c-465f-ae95-e8510596177b',
  '6c283773-d58d-4f91-8365-dafbaa9990c1',
  '00931440-f1b2-4385-9f1d-452cc2ca7be6',
  '016ca0de-f289-4c44-92cc-16e84fad2ee0',
  '5bf323d4-0eab-493c-a200-c0c13e5f1304',
  '2b2fc757-4bfd-4be8-915f-0901340e1917',
  '6b8d5fe5-fa6a-46e7-96da-97eb2e880b5d',
  'e6bf0316-8275-4243-b901-8a45d9d8939d',
  '8065c462-0891-496e-999e-18c59c40bd95',
  'e4e323fe-b4e7-41eb-a94a-e173e3468127',
  'fb6e8e4b-b167-4a2c-bb81-0aa494d137c6',
  '858f3343-22ba-4e46-b604-6ff65408b817',
  '3cd0f320-5a8e-44fb-b851-643444c9a56d',
  '5652e32d-4877-4c7f-9acb-65bf1659b880',
  'c6e3d00b-84c3-4a33-b10c-f5629b739f21',
  '0bfa15df-72a5-490a-8124-7ed2ff0906e9',
  '71661b48-2516-4711-9634-8cc7af9b15b2',
  'cd116813-dfae-45ef-b2c5-ce728c0d0f44',
  '68ec04c9-6a3c-4908-8b8f-534c4be7ec3e',
  '7dca62b1-b241-42be-93b3-2ba468501e55',
  'd86bcd61-c2d5-49b9-aa28-ae117f7b66b0',
  'affb082d-3d0b-470f-92de-217b59dc6936',
  '4287f354-63bc-48e9-b09c-61cf60a9b453',
];

// =======================
// beforeScenario
// =======================
export const beforeScenario = (context: any, ee: any, next: Function) => {
  const randomIndex = Math.floor(Math.random() * USER_IDS.length);
  context.vars.userId = USER_IDS[randomIndex];
  context.vars.idempotencyKey = randomUUID();
  context.vars.authToken = 'Bearer ' + randomUUID();
  return next();
};

// ==================== CONFIG ====================

// Lấy random restaurantId từ response
export function randomRestaurant(
  requestParams: any,
  response: any,
  context: any,
  ee: any,
  next: Function,
) {
  const data = JSON.parse(response.body).data || [];
  if (data.length > 0) {
    const index = Math.floor(Math.random() * data.length);
    context.vars.restaurantId = data[index].id;
  }
  return next();
}

// Lấy random menuItemId từ response
export function randomMenuItem(
  requestParams: any,
  response: any,
  context: any,
  ee: any,
  next: Function,
) {
  const data = JSON.parse(response.body).data || [];
  if (data.length > 0) {
    const index = Math.floor(Math.random() * data.length);
    context.vars.menuItemId = data[index].id;
  }
  return next();
}

export const fixedMenuItemAndRestaurant = (
  context: any,
  ee: any,
  next: Function,
) => {
  const randomIndex = Math.floor(Math.random() * USER_IDS.length);
  context.vars.userId = USER_IDS[randomIndex];
  context.vars.idempotencyKey = randomUUID();
  context.vars.authToken = 'Bearer ' + randomUUID();
  context.vars.restaurantId = '1670cd7c-74fc-4d2d-9ad4-4a22ee499f3b';
  context.vars.menuItemId = '0777a4b2-0242-4103-a06a-4bf4a315c641';
  return next();
};
