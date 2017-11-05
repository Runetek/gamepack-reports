<template>
  <section class="section">
    <div class="columns">
      <div class="column">
        <div class="field">
          <label for="revision" class="label">Revision</label>
          <div class="control">
            <div class="select">
              <select
                id="revision"
                name="revision"
                v-model="revision"
              >
                <option value="">Select a revision</option>
                <option
                  v-for="rev in revisions"
                  :value="rev"
                  :key="rev"
                >
                  {{ rev }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div class="column">
        <div class="field">
          <label for="report-type" class="label">Report Type</label>
          <div class="control">
            <div class="select">
              <select
                id="report-type"
                name="report-type"
                v-model="reportType"
              >
                <option value="">Select a report</option>
                <option
                  v-for="report in reportTypes"
                  :value="report"
                  :key="report"
                >
                  {{ shortName(report) }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="field">
      <div v-if="artifacts.deob" class="is-inline-block">
        <a
          :href="artifacts.deob.url"
          target="_blank"
          class="tags has-addons"
        >
          <span class="tag is-dark">Artifact</span>
          <span class="tag is-danger">runelite-deob.jar</span>
        </a>
      </div>
      <div v-if="artifacts.pack" class="is-inline-block">
        <a
          :href="artifacts.pack.url"
          target="_blank"
          class="tags has-addons"
        >
          <span class="tag is-dark">Artifact</span>
          <span class="tag is-warning">gamepack.jar</span>
        </a>
      </div>
    </div>
    <p v-if="reportType.startsWith('com.uniquepassive.osrsexploits')">
      <a
        class="button is-small"
        target="_blank"
        :href="`https://github.com/UniquePassive/osrs-exploits/blob/master/src/main/java/${reportType.replace(/\./g, '/')}.java`"
      >
        <span class="icon">
          <i class="fa fa-github"></i>
        </span>
        <span>{{ shortName(reportType) }}.java</span>
      </a>
      <a
        class="button is-small"
        target="_blank"
        href="https://github.com/UniquePassive/osrs-exploits"
      >
        <span class="icon">
          <i class="fa fa-github"></i>
        </span>
        <span>UniquePassive/osrs-exploits</span>
      </a>
    </p>
    <div class="box">
      <pre v-text="report"></pre>
    </div>
  </section>
</template>

<script>
import Axios from 'axios'
import { parseString } from 'xml2js'
import { last, sortBy, uniq } from 'lodash'

const reports = Axios.create({
  baseURL: 'https://storage.runetek.io/reports'
})

const gpack = Axios.create({
  baseURL: 'https://gpack.me/api'
})

export default {
  name: 'ReportViewer',
  props: {
    rt: String,
    rev: String
  },
  data () {
    return {
      keys: [],
      cache: {},
      loading: false,
      revision: this.$route.query.rev || '',
      reportType: this.$route.query.rt || '',
      report: '',
      artifacts: {
        pack: null,
        deob: null
      }
    }
  },
  computed: {
    revisions () {
      return sortBy(uniq(this.keys.map(x => x.split('/')[0])), x => +x)
    },
    reportTypes () {
      return uniq(this.keys.map(x => x.split('/')[1].replace(/\.(txt|json)$/, '')))
    },
    shortReportTypes () {
      return this.reportTypes.map(x => this.shortName(x))
    },
    reportPath () {
      const [rev, type] = [this.revision, this.reportType]
      if (rev === '' || type === '') {
        return ''
      }

      return `${rev}/${type}.txt`
    }
  },
  methods: {
    fetchArtifacts () {
      gpack.get(`artifacts/${this.revision}`)
        .then(({ data }) => {
          this.artifacts = {
            ...this.artifacts,
            ...data
          }
        })
    },
    shortName (reportType) {
      return last(reportType.split('.'))
    },
    fetchReport () {
      const path = this.reportPath
      if (path) {
        reports.get(path)
          .then(({ data }) => {
            this.report = data
          })
      }
    }
  },
  mounted () {
    reports.get('/')
      .then(({ data }) => parseString(data, (err, xml) => {
        if (err) {
          throw err
        } else {
          this.keys = xml.ListBucketResult.Contents.map(x => x.Key[0])
          this.$nextTick(() => this.fetchReport())
          this.$nextTick(() => this.fetchArtifacts())
        }
      }))
  },
  watch: {
    revision (rev) {
      this.fetchReport()
      this.fetchArtifacts()
      if (rev !== '') {
        this.$router.push({
          name: 'reports',
          query: {
            ...this.$route.query,
            rev
          }
        })
      } else {
        delete this.$route.query['rev']
      }
    },
    reportType (rt) {
      this.fetchReport()
      if (rt !== '') {
        this.$router.push({
          name: 'reports',
          query: {
            ...this.$route.query,
            rt
          }
        })
      } else {
        delete this.$route.query['rt']
      }
    }
  }
}
</script>
