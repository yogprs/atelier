# Deployment dan FluxCD

Repo ini membangun image frontend dan mendorongnya ke GHCR. FluxCD membaca tag
image dari GHCR, menulis tag baru ke repo konfigurasi Flux, lalu Kubernetes
menerapkan Deployment.

Pemisahan yang disarankan:

| Repo | Tanggung jawab |
| --- | --- |
| `atelier` (repo ini) | Source, Dockerfile, GitHub Actions, image GHCR, SBOM/provenance |
| repo Flux config, misalnya `flux-config` | `ImageRepository`, `ImagePolicy`, `ImageUpdateAutomation`, Kustomization, Deployment, Service, Ingress, secret |

Untuk satu VPS, Deployment boleh disalin ke repo Flux config. Jika tim web ingin
mengelola probe dan env, `deploy/k8s` dapat dijadikan base, tetapi image automation
harus menulis hanya ke satu lokasi (repo Flux config).

## Image dan tag

Image: `ghcr.io/yogprs/atelier`.

Workflow membangun image pada push `main` dan tag `v*.*.*`.

- push `main`: `sha-<full>`, `main`, dan `main-YYYYMMDDHHmmss-<sha>`
- tag `v1.2.3`: `sha-<full>`, `1.2.3`, `1.2`, `latest`

Flux sebaiknya mengikuti tag immutable `main-YYYYMMDDHHmmss-<sha>`. Jangan memakai
`latest` atau tag `main` yang mutable untuk `ImagePolicy`, karena nama tag tidak
berubah saat image diperbarui.

## Konfigurasi build

Frontend memakai build-time env:

- `VITE_API_BASE_URL=https://madgo.my.id`
- `VITE_API_ORIGIN=https://madgo.my.id` (origin host, tanpa `/api`)

Nilai ini masuk ke bundle JavaScript, bukan secret. Atur sebagai repository
variables `VITE_API_BASE_URL` dan `VITE_API_ORIGIN`; workflow memakai nilai
production sebagai fallback. Perubahan API memerlukan build image baru.

## GHCR

Workflow publish memakai `GITHUB_TOKEN` dengan `packages: write` dan menulis ke
namespace repo upstream `ghcr.io/yogprs/atelier`. Package baru biasanya private.

Jika package private, Flux dan kubelet memerlukan kredensial read-only terpisah:

```bash
kubectl -n flux-system create secret docker-registry ghcr-read \
  --docker-server=ghcr.io \
  --docker-username=<github-user> \
  --docker-password="$GHCR_READ_TOKEN"

kubectl -n atelier create secret docker-registry ghcr-pull \
  --docker-server=ghcr.io \
  --docker-username=<github-user> \
  --docker-password="$GHCR_READ_TOKEN"
```

Token `GHCR_READ_TOKEN` cukup `read:packages`. Untuk `ImageRepository`, tambahkan
`secretRef` ke `ghcr-read`; untuk Pod, `imagePullSecrets` ke `ghcr-pull`. Jika
package dibuat public, keduanya bisa dihapus.

## Flux

File `deploy/flux/image-automation.example.yaml` adalah template untuk repo Flux
config. Salin ke repo tersebut, lalu sesuaikan:

- nama `GitRepository` (`flux-system`);
- path overlay, misalnya `./apps/prod/atelier`;
- namespace `atelier`;
- apakah Flux commit langsung ke `main` atau ke branch review.

Contoh setter di `deploy/k8s/kustomization.yaml`:

```yaml
images:
  - name: ghcr.io/yogprs/atelier
    newTag: "0.0.0" # {"$imagepolicy": "flux-system:atelier:tag"}
```

`ImageUpdateAutomation` mengganti nilai `newTag` ketika `ImagePolicy` memilih tag
baru. Jangan menaruh setter di base dan overlay sekaligus. Jalankan Flux dengan
polling GHCR; webhook tidak wajib untuk VPS.

Perintah pemeriksaan:

```bash
flux get image repository atelier -n flux-system
flux get image policy atelier -n flux-system
flux get image update atelier -n flux-system
flux get kustomization atelier -n flux-system
flux reconcile image repository atelier -n flux-system
flux reconcile image update atelier -n flux-system
flux reconcile kustomization atelier --with-source -n flux-system
```

## Manifest Kubernetes

`deploy/k8s` berisi namespace, Deployment, Service, Ingress, dan Kustomization.

Nilai yang perlu disesuaikan sebelum apply:

- `imagePullSecrets: ghcr-pull` (hapus jika package public);
- `ingressClassName: nginx` (sesuaikan dengan ingress controller VPS);
- host `atelier.web.id` dan `tls.secretName`;
- annotation cert-manager jika memakai cert-manager;
- replica dan resource limit.

Ingress belum mengatur API proxy. Frontend memanggil API `madgo.my.id` secara
cross-origin; backend harus mengizinkan origin `https://atelier.web.id`, dan
WebSocket harus mengizinkan origin yang sama. Jika nanti API diproksikan melalui
domain frontend, tambahkan location `/api/` dan `/ws` di nginx, termasuk header
Upgrade dan redaksi token pada access log.

## Checklist sebelum publish

- [ ] Actions mengizinkan workflow menulis package (`packages: write`).
- [ ] Repository variables `VITE_API_BASE_URL` dan `VITE_API_ORIGIN` diisi.
- [ ] `main` dilindungi dan PR wajib melewati quality serta docker-build.
- [ ] Tag `v*.*.*` dilindungi untuk rilis.
- [ ] Package GHCR private/public diputuskan.
- [ ] `ghcr-read` dan `ghcr-pull` dibuat jika private.
- [ ] `main-*` dipakai sebagai policy Flux, bukan `latest`.
- [ ] Flux config memakai repo terpisah dan credential Git untuk push.
