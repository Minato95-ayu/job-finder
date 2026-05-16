provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_cloud_run_v2_service" "api" {
  name     = "job-finder-api"
  location = var.region

  template {
    containers {
      image = "us-central1-docker.pkg.dev/${var.project_id}/job-finder/api:latest"
      env {
        name  = "REDIS_URL"
        value = google_redis_instance.cache.host
      }
    }
    scaling {
      max_instance_count = 100
      min_instance_count = 2
    }
  }
}

resource "google_redis_instance" "cache" {
  name           = "job-finder-cache"
  tier           = "STANDARD_HA"
  memory_size_gb = 5
  region         = var.region
}

resource "google_sql_database_instance" "master" {
  name             = "job-finder-db"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier = "db-f1-micro"
    backup_configuration {
      enabled = true
    }
    ip_configuration {
      ipv4_enabled = true
    }
  }
}
