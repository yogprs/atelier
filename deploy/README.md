# Deployment

Manifest produksi Atelier disimpan di repo ini pada `deploy/k8s`. Repo
`k3s-opt` hanya menyimpan policy cluster dan Flux `GitRepository` yang menunjuk
ke repository ini.

## Alur deploy

```text
push/merge main
  -> GitHub Actions quality + docker-build
  -> publish image immutable ke GHCR
  -> deploy job update tag di deploy/k8s/kustomization.yaml
  -> commit ke main dengan [skip ci]
  -> Flux menarik repo atelier path ./deploy/k8s
  -> Flux menerapkan Deployment/Service/Ingress
```

Tidak ada commit image ke `k3s-opt`. `k3s-opt` hanya berisi namespace, PSA,
NetworkPolicy global, quota, cert-manager, dan pointer Flux.

## Image

- Registry: `ghcr.io/yogprs/atelier`
- Platform: `linux/amd64`
- Tag deployment: immutable `main-YYYYMMDDHHmmss-<sha>`
- Package public; `imagePullSecret` tidak diperlukan

Jangan memakai `latest` atau `main` sebagai tag deployment.

## Kontrak runtime

- Port container `8080`, nama port `http`.
- Liveness/readiness `GET /healthz`.
- UID/GID `101:101`; non-root.
- `readOnlyRootFilesystem: true`, hanya `/tmp` writable (emptyDir 16Mi).
- `StopSignal=SIGQUIT`; stop normal di bawah 1 detik, target maksimum 30 detik.
- Stateless, tanpa PVC.
- Request `50m` CPU / `64Mi`; limit `250m` CPU / `128Mi`.

## GHCR private

Jika package diubah private, sediakan token read-only melalui saluran aman dan
buat `imagePullSecret` di repo `k3s-opt` dengan SOPS. Jangan menaruh token di
repo ini.

## Catatan

- Jangan menjalankan `kubectl apply` dari CI aplikasi.
- Perubahan manifest produksi dilakukan lewat PR ke repo ini.
- `k3s-opt` tetap menjadi pemilik policy namespace dan jaringan.
