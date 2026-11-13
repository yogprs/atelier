# Deployment

Manifest produksi Atelier sekarang berada di repo **`k3s-opt`**. Repo Atelier hanya
membangun source, image GHCR, dan menjaga kontrak runtime image.

Sumber kebenaran deployment:

```text
k3s-opt/apps/base/atelier/
k3s-opt/apps/production/atelier/
k3s-opt/apps/production/kustomization.yaml
```

`deploy/k8s` dan `deploy/flux` sudah dipindahkan dari repo ini. Jangan menambahkan
manifest cluster baru di sini dan jangan menjalankan `kubectl apply` dari CI aplikasi.

## Image

- Registry: `ghcr.io/yogprs/atelier`
- Platform: `linux/amd64`
- Tag immutable terakhir: `main-20261108164420-f36f3b1`
- Digest terakhir:
  `sha256:53b7ca190ddb257cd248dcc577da8473896bb0d273e4c193f7e4ff29681f6088`
- Package saat ini public; `imagePullSecret` tidak diperlukan.

Jangan memakai `latest` atau `main` sebagai tag deployment. Gunakan digest atau tag
`main-YYYYMMDDHHmmss-<sha>`.

## Kontrak runtime

- Port container `8080`, nama port `http`.
- Liveness dan readiness memakai `GET /healthz`.
- Berjalan sebagai UID/GID `101:101`.
- Hanya `/tmp` yang writable; aman dengan `readOnlyRootFilesystem: true` dan emptyDir
  `/tmp` berukuran 16Mi.
- `StopSignal=SIGQUIT`; stop normal di bawah 1 detik, target maksimum 30 detik.
- Stateless, tanpa PVC, tanpa metrics/version endpoint.
- Requests `50m` CPU / `64Mi` memory; limits `250m` CPU / `128Mi` memory.

## Build-time env

Nilai berikut ditanamkan saat build dan bukan secret:

```text
VITE_API_BASE_URL=https://madgo.my.id
VITE_API_ORIGIN=https://madgo.my.id
VITE_DEFAULT_TIMEOUT=15000
```

Jika API pindah domain, image harus dibangun ulang dan digest baru dipakai.

## CI

`.github/workflows/ci.yml` menjalankan:

- quality: `pnpm install --frozen-lockfile` dan `pnpm build`;
- docker-build pada PR: build image tanpa push dan smoke test SPA/health;
- publish pada `main`/tag: push ke GHCR dengan provenance dan SBOM.

Branch `main` harus dilindungi dan PR wajib melewati quality serta docker-build.
Workflow publish dibatasi ke `github.repository == 'yogprs/atelier'`.

## GHCR private

Jika package diubah menjadi private, sediakan token read-only dengan nama variabel
`GHCR_READ_TOKEN` dan scope `read:packages` melalui saluran aman. Secret image pull
dibuat di `k3s-opt` dengan SOPS sebagai `ghcr-pull`; jangan menaruh nilainya di repo ini.

Detail handoff dan bukti runtime ada di `k3s-opt/handoff/atelier/REPLY.md`.
