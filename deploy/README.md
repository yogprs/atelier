# Deployment

Repo Atelier hanya membangun dan mempublikasikan image. Manifest produksi dan
Flux Image Automation berada di repo **`k3s-opt`**:

```text
k3s-opt/apps/base/atelier/
k3s-opt/apps/production/atelier/
k3s-opt/clusters/production/atelier.yaml
```

## Alur rilis

```text
push/merge main Atelier
  -> GitHub Actions quality + docker-build
  -> publish image immutable main-YYYYMMDDHHmmss-<sha> ke GHCR
  -> Flux ImageRepository mendeteksi tag baru
  -> ImagePolicy memilih tag tertinggi
  -> ImageUpdateAutomation menulis tag ke k3s-opt
  -> Flux Kustomization menerapkan apps/production
```

Tidak ada job deploy atau commit bot di repo Atelier. Deploy dilakukan oleh Flux
di cluster; tag image ditulis ke `k3s-opt`, bukan ke repo ini.

## Aturan image

- Registry: `ghcr.io/yogprs/atelier`
- Platform: `linux/amd64`
- Tag: `main-YYYYMMDDHHmmss-<sha>`; package public
- Jangan memakai `latest` atau `main` sebagai tag deployment.
- Port `8080` (`http`), probe `/healthz`, UID/GID `101:101`, read-only root,
  `/tmp` emptyDir 16Mi, resource `50m/64Mi` request dan `250m/128Mi` limit.

## CI

Workflow hanya quality, build, dry smoke test pada PR, dan publish GHCR pada
main/tag. Jika package diubah private, sediakan token read-only lewat saluran
aman untuk Secret Flux di `k3s-opt`.
