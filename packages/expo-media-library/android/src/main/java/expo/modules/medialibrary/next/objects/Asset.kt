package expo.modules.medialibrary.next.objects

import android.content.ContentUris
import android.content.Context
import android.os.Build
import expo.modules.kotlin.exception.Exceptions.ReactContextLost
import expo.modules.kotlin.sharedobjects.SharedObject
import expo.modules.medialibrary.AssetFileException
import expo.modules.medialibrary.next.exceptions.AssetPropertyNotFoundException
import expo.modules.medialibrary.next.extensions.resolver.EXTERNAL_CONTENT_URI
import expo.modules.medialibrary.next.extensions.resolver.copyUriContent
import expo.modules.medialibrary.next.extensions.resolver.insertPendingAsset
import expo.modules.medialibrary.next.extensions.resolver.publishPendingAsset
import expo.modules.medialibrary.next.extensions.resolver.queryAssetDisplayName
import expo.modules.medialibrary.next.extensions.resolver.queryAssetDuration
import expo.modules.medialibrary.next.extensions.resolver.queryAssetHeight
import expo.modules.medialibrary.next.extensions.resolver.queryAssetMediaType
import expo.modules.medialibrary.next.extensions.resolver.queryAssetModificationDate
import expo.modules.medialibrary.next.extensions.resolver.queryAssetUri
import expo.modules.medialibrary.next.extensions.resolver.queryAssetWidth
import expo.modules.medialibrary.next.extensions.resolver.queryGetCreationTime
import java.io.File

open class Asset(val id: Long, val context: Context) : SharedObject() {
  private val contentResolver by lazy {
    context.contentResolver ?: throw ReactContextLost()
  }
  val contentUri = ContentUris.withAppendedId(EXTERNAL_CONTENT_URI, id)

  suspend fun getCreationTime(): Long? =
    contentResolver.queryGetCreationTime(contentUri).takeIf { it != 0L }

  suspend fun getDuration(): Long? =
    contentResolver.queryAssetDuration(contentUri).takeIf { it != 0L }

  suspend fun getFilename(): String =
    contentResolver.queryAssetDisplayName(contentUri)
      ?: throw AssetPropertyNotFoundException("Filename")

  suspend fun getHeight(): Int =
    contentResolver.queryAssetHeight(contentUri)
      ?: throw AssetPropertyNotFoundException("Height")

  suspend fun getMediaType(): Int =
    contentResolver.queryAssetMediaType(contentUri)
      ?: throw AssetPropertyNotFoundException("MediaType")

  suspend fun getModificationTime(): Long? =
    contentResolver.queryAssetModificationDate(contentUri).takeIf {it != 0L}

  suspend fun getUri(): String =
    contentResolver.queryAssetUri(contentUri)
      ?: throw AssetPropertyNotFoundException("Uri")

  suspend fun getWidth(): Int =
    contentResolver.queryAssetWidth(contentUri)
      ?: throw AssetPropertyNotFoundException("Width")

  fun getMimeType(): String? {
    return contentResolver.getType(contentUri)
  }

  suspend fun copy(targetRelativePath: String): Asset {
    val newAssetUri = contentResolver.insertPendingAsset(getFilename(), getMimeType(), targetRelativePath)
    contentResolver.copyUriContent(contentUri, newAssetUri)
    contentResolver.publishPendingAsset(newAssetUri)
    return Asset(ContentUris.parseId(newAssetUri), context)
  }

  // TODO: Find a better solution for moving an asset to an album.
  // Currently: Android API <29 requires to delete and create a new file in order to do this.
  // This results in creating a new entry in the database with a new ID and causes an unwanted behaviour.
  // Example:
  // const album = Album.create("album1")
  // album.add(Asset.create("file:///x/y/z"))
  // album.contains(asset) -> FALSE, suppose to be true
  suspend fun move(targetRelativePath: String): Asset {
    val asset = copy(targetRelativePath)
    delete()
    return asset
  }

  suspend fun delete() {
    // Android versions 29 and earlier requires to manually remove a file
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
      if (!File(getUri()).delete()) {
        throw AssetFileException("Could not delete file.")
      }
    }
    contentResolver.delete(contentUri, null, null)
  }
}
