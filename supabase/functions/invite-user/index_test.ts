// @ts-ignore: Deno module
import { assertEquals, assertMatch } from "https://deno.land/std@0.168.0/testing/asserts.ts";

function getFirstName(fullName: string) {
  return fullName.trim().split(" ")[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function generateDigits() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// @ts-ignore: Deno global
Deno.test("getFirstName extrae el primer nombre correctamente", () => {
  assertEquals(getFirstName("Pedro Páramo"), "pedro");
  assertEquals(getFirstName(" María  del Carmen "), "maria");
  assertEquals(getFirstName("Ángela Sánchez"), "angela");
});

// @ts-ignore: Deno global
Deno.test("generateDigits genera 4 dígitos", () => {
  const digits = generateDigits();
  assertEquals(digits.length, 4);
  assertMatch(digits, /^[0-9]{4}$/);
});
