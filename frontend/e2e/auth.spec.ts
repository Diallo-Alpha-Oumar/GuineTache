import { test, expect } from '@playwright/test'

test.describe('Page de connexion', () => {
  test('redirige la racine vers /login pour un visiteur non authentifié', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { name: 'Bienvenue' })).toBeVisible()
  })

  test('affiche des erreurs de validation sur un formulaire vide', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: 'Se connecter' }).click()

    await expect(page.getByText(/email/i).first()).toBeVisible()
    await expect(page).toHaveURL(/\/login$/)
  })

  test('affiche une erreur pour un email invalide', async ({ page }) => {
    await page.goto('/login')
    await page.locator('#email').fill('pas-un-email')
    await page.locator('#password').fill('quelquechose')
    await page.getByRole('button', { name: 'Se connecter' }).click()

    await expect(page).toHaveURL(/\/login$/)
  })

  test('permet de naviguer vers la page d’inscription', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: "S'inscrire" }).click()
    await expect(page).toHaveURL(/\/register$/)
    await expect(page.getByRole('heading', { name: 'Créer un compte' })).toBeVisible()
  })
})

test.describe('Page d’inscription', () => {
  test('affiche une erreur si les mots de passe ne correspondent pas', async ({ page }) => {
    await page.goto('/register')
    await page.locator('#fullName').fill('Mamadou Bah')
    await page.locator('#email').fill('mamadou.bah@example.com')
    await page.locator('#password').fill('MotDePasse123!')
    await page.locator('#confirmPassword').fill('AutreMotDePasse123!')
    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: /créer/i }).click()

    await expect(page.getByText(/correspond/i)).toBeVisible()
  })
})
